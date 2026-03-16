import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type EntityHeaderProps = {
  title: string;
  description?: string;
  newButtonnLabel?: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  newButtonnLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button disabled={disabled || isCreating} size="sm" onClick={onNew}>
          <PlusIcon className="size-4" />
          {newButtonnLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Link href={newButtonHref} prefetch>
          <PlusIcon className="size-4" />
          {newButtonnLabel}
        </Link>
      )}
    </div>
  );
};

type EntityContainerProps = {
  header: React.ReactNode;
  search: React.ReactNode;
  pagination: React.ReactNode;
  children: React.ReactNode;
}

export const EntityContainer = ({ header, search, pagination, children }: EntityContainerProps ) => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen w-full flex flex-col gap-y-8 h-full">
        {header}
        <div className="flex flex-col h-full gap-y-4">
          {search}
          {children}
        </div>
          {pagination}
      </div>
    </div>
  )
}
