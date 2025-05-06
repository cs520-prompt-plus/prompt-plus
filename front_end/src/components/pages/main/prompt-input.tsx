import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState } from "react";

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
  /** Called when validation completes: (isValid, feedback) */
  onValidated?: (valid: boolean, feedback: string) => void;
  input: string;
  setInput: (input: string) => void;
}) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  // Animate dots when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
    } else {
      setDots("");
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Debounced validation: run 500ms after user stops typing
  const validatePrompt = useCallback(() => {
    if (!input.trim()) {
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
    fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    })
      .then((res) => res.json())
      .then((data: ValidationResult) => {
        setValidation(data);
        onValidated?.(data.valid, data.feedback);
      })
      .catch(() => {
        setValidation({
          valid: false,
          reason: "error",
          feedback: "Validation failed. Try again.",
        });
      })
      .finally(() => setLoading(false));
  }, [input, onValidated]);

  // effect with debounce
  useEffect(() => {
    const timer = setTimeout(validatePrompt, 500);
    return () => clearTimeout(timer);
  }, [input, validatePrompt]);

  // Determine border color based on validation state
  const borderColorClass = validation
    ? validation.valid
      ? "border-green-500"
      : "border-red-500"
    : "border-gray-300";

  return (
    <div className="flex flex-col space-y-2">
      <Textarea
        id="input"
        placeholder="Here is my prompt: I want to build a web application that allows users to create and share their own recipes."
        className={`flex-1 min-h-[35vh] w-full border ${borderColorClass} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />

      {loading && <p className="text-sm text-gray-500">Validating{dots}</p>}
      {validation && (
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
