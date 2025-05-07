import React, { useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { Textarea } from "@/components/ui/textarea";

interface ValidationResult {
  valid: boolean;
  reason: string;
  feedback: string;
}

export function PromptInput({
  onValidated,
  input,
  setInput,
}: {
  onValidated?: (valid: boolean, feedback: string) => void;
  input: string;
  setInput: (input: string) => void;
}) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  // 1) create a stable validation function
  const validatePrompt = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        const res = {
          valid: false,
          reason: "empty",
          feedback: "Prompt cannot be empty.",
        };
        setValidation(res);
        onValidated?.(res.valid, res.feedback);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: value }),
        });
        const data: ValidationResult = await res.json();
        setValidation(data);
        onValidated?.(data.valid, data.feedback);
      } catch {
        const err = {
          valid: false,
          reason: "error",
          feedback: "Validation failed. Try again.",
        };
        setValidation(err);
        onValidated?.(false, err.feedback);
      } finally {
        setLoading(false);
      }
    },
    [onValidated]
  );

  // 2) debounce that function (only trailing call)
  const debouncedValidate = useMemo(
    () => debounce(validatePrompt, 1000, { leading: false, trailing: true }),
    [validatePrompt]
  );

  // 3) call debouncedValidate whenever input changes
  useEffect(() => {
    debouncedValidate(input);
    // cleanup on unmount
    return () => {
      debouncedValidate.cancel();
    };
  }, [input, debouncedValidate]);

  // animated dots
  useEffect(() => {
    if (!loading) {
      setDots("");
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % 4;
      setDots(".".repeat(i));
    }, 500);
    return () => clearInterval(id);
  }, [loading]);

  const borderClass = loading
    ? "border-yellow-500 focus:ring-yellow-500"
    : validation
    ? validation.valid
      ? "border-green-500 focus:ring-green-500"
      : "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-blue-500";

  return (
    <div className="flex flex-col space-y-2">
      <Textarea
        id="input"
        placeholder="Here is my prompt: I want to build a web application that allows users to create and share their own recipes."
        className={`flex-1 min-h-[35vh] w-full rounded-md border ${borderClass}`}
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />

      {loading && (
        <p className="text-sm text-yellow-600">{`Validating${dots}`}</p>
      )}
      {validation && !loading && (
        <p
          className={`text-sm ${
            validation.valid ? "text-green-600" : "text-red-600"
          }`}
        >
          {validation.feedback}
        </p>
      )}
    </div>
  );
}
