"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { CredentialType } from "../../../../lib/generated/prisma/browser";
import { useCredentialsByType } from "../../../credentials/hooks/use-credentials";

export const AI_AVAILABLE_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3-flash",
  "gemini-3-pro",
] as const;

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Please enter a variable name" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message:
        "Variable must start with a letter or underscore and can only contain letters, numbers, and underscores",
    }),
  credentialId: z
    .string()
    .min(1, { message: "Please select a credential" })
    .optional(),
  model: z.enum(AI_AVAILABLE_MODELS),
  systemPrompt: z.string().optional(),
  userPrompt: z
    .string()
    .min(1, { message: "Please enter a user prompt" })
    .max(1000, { message: "User prompt is too long" }),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<GeminiFormValues>;
}

export const GeminiDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const {
    data: credentials,
    isLoading: credentialsLoading,
  } = useCredentialsByType(CredentialType.GEMINI);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "",
      credentialId: defaultValues.credentialId ?? "",
      model: defaultValues.model ?? AI_AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt ?? "",
      userPrompt: defaultValues.userPrompt ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "",
        credentialId: defaultValues.credentialId ?? credentials?.[0]?.id ?? "",
        model: defaultValues.model ?? AI_AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt ?? "",
        userPrompt: defaultValues.userPrompt ?? "",
      });
    }
  }, [
    open,
    form,
    defaultValues.credentialId,
    defaultValues.model,
    defaultValues.variableName,
    defaultValues.userPrompt,
    defaultValues.systemPrompt,
    credentials,
  ]);

  const watchVariableName = useWatch({
    control: form.control,
    name: "variableName",
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gemini Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompt for this node.
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-rhf-gemini"
          onSubmit={form.handleSubmit(handleFormSubmit)}
        >
          <FieldGroup>
            <Controller
              name="variableName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-varname">
                    Variable Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-varname"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter variable name"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Use this name to reference the request in your workflow.
                    {"{{" + (watchVariableName || "apiExample") + ".text}}"}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="credentialId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-select-credential">
                    Gemini Credential
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      credentialsLoading ||
                      !credentials ||
                      credentials.length === 0
                    }
                  >
                    <SelectTrigger
                      id="form-rhf-select-credential"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select credential" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={"/logos/gemini.svg"}
                              alt={credential.name}
                              width={16}
                              height={16}
                            />
                            {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select the AI model to use for this request.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="model"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-select-model">Model</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-rhf-select-model"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {AI_AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select the AI model to use for this request.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="systemPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-systemPrompt">
                    System Prompt (Optional)
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-systemPrompt"
                      placeholder="You are a helpful assistant."
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field?.value?.length}/1000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Optional instructions to guide the AI&apos;s responses.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="userPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-userPrompt">
                    User Prompt
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-demo-userPrompt"
                      placeholder="Summarize the following article: {{httpResponse.data.article}}"
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field?.value?.length}/1000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    The main prompt that will be sent to the AI model. You can
                    use variables like {"{{variableName.property}}"} to
                    reference other nodes.
                  </FieldDescription>{" "}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              className="w-full mt-6"
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
