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

import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Textarea } from "../../../../components/ui/textarea";

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
  username: z.string().optional(),
  content: z.string().min(1, { message: "Please enter content" }).max(2000, {
    message: "Content is too long",
  }),
  webhookUrl: z.string().min(1, { message: "Please enter a webhook URL" }).url({
    message: "Please enter a valid URL",
  }),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<DiscordFormValues>;
}

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "",
      content: defaultValues.content ?? "",
      username: defaultValues.username ?? "",
      webhookUrl: defaultValues.webhookUrl ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "",
        content: defaultValues.content ?? "",
        username: defaultValues.username ?? "",
        webhookUrl: defaultValues.webhookUrl ?? "",
      });
    }
  }, [
    open,
    form,
    defaultValues.variableName,
    defaultValues.content,
    defaultValues.username,
    defaultValues.webhookUrl,
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
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure the Discord webhook for this node.
          </DialogDescription>
        </DialogHeader>
        <form
          id="form-rhf-discord"
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
              name="webhookUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-webhookUrl">
                    Webhook URL
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-webhookUrl"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Get this from DiscordChannel &gt; Settings &gt; Integrations &gt; Webhooks &gt; Create Webhook
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-textarea-content">Message Content</FieldLabel>
                  <Textarea
                    {...field}
                    id="form-rhf-textarea-content"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the message content..."
                    className="min-h-30"
                  />
                  <FieldDescription>
                    The content of the message to send to Discord. You can use
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-username">
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter a username"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    The username to display for the message.
                  </FieldDescription>
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
