"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import z from "zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  variableName: z
  .string()
  .min(1, { message: "Please enter a variable name" })
  .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, { message: "Variable must start with a letter or underscore and can only contain letters, numbers, and underscores" }),
  endpoint: z.string().min(1, { message: "Please enter a valid URL" }),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  body: z.string().optional(),
  // .refine(),
});

export type HttpRequesFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<HttpRequesFormValues>;
}

export const HttpRequestDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName ?? "",
      endpoint: defaultValues.endpoint ?? "",
      method: defaultValues.method ?? "GET",
      body: defaultValues.body ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName ?? "",
        endpoint: defaultValues.endpoint ?? "",
        method: defaultValues.method ?? "GET",
        body: defaultValues.body ?? "",
      });
    }
  }, [open, form, defaultValues.body, defaultValues.endpoint, defaultValues.method, defaultValues.variableName]);
  
  const watchVariableName = useWatch({
    control: form.control,
    name: "variableName",
  })
  const watchMethod = useWatch({
    control: form.control,
    name: "method",
  });
  
  useEffect(() => {
    if (watchMethod === "GET") {
      form.setValue("body", "");
    }
  }, [watchMethod, form]);
  
  const showBodyField = ["POST", "PUT", "DELETE", "PATCH"].includes(
    watchMethod,
  );

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP request.
          </DialogDescription>
        </DialogHeader>
        <form id="form-rhf-http" onSubmit={form.handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <Controller
              name="variableName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-endpoint">
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
                    {"{{$" + (watchVariableName || "apiExample") + ".httpResponse.data}}"}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="method"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-select-method">
                    Method
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-rhf-select-method"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    The HTTP method to use for the request.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="endpoint"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-input-endpoint">
                    Endpoint
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-endpoint"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Static URL or use {"{{variables}}"} for simple values or{" "}
                    {"{{json variable}}"} for stringified JSON.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            
          {showBodyField && (
            <Controller
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-body">
                    Body
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-rhf-body"
                      placeholder='{ "name": "John Doe" }'
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  <FieldDescription>
                    JSON with template variables. Use {"{{json variable}}"} for stringified JSON.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
          </FieldGroup>
          <DialogFooter>
            <Button className="w-full mt-6" disabled={form.formState.isSubmitting} type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
