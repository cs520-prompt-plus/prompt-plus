import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";
import React, { FC } from "react";

export interface SkelentonWrapperProps
  extends React.ComponentProps<typeof Skeleton> {
  loading: boolean;
  children?: React.ReactNode;
  className?: string;
  outerClassName?: string;
}

export const SkeletonWrapper: FC<SkelentonWrapperProps> = ({
  children,
  className,
  loading,
  outerClassName,
}) => {
  return (
    <div className={cn("relative h-full w-full", outerClassName)}>
      {loading && (
        <Skeleton className={cn("h-full w-full bg-gray-400", className)} />
      )}
      <div
        className={cn("h-full w-full", {
          hidden: loading,
        })}
      >
        {children}
      </div>
    </div>
  );
};
