"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useUpgradeModal } from "../../../hooks/use-upgrade-modal";
import { CredentialType } from "../../../lib/generated/prisma/enums";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";

interface CredentialItemProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(CredentialType),
  value: z.string().min(1, { message: "Value is required" }),
});

const credentialsTypesOptions = [
  {
    label: "Gemini",
    value: CredentialType.GEMINI,
    logo: "/logos/gemini.svg",
  },
  {
    label: "Anthropic",
    value: CredentialType.ANTHROPIC,
    logo: "/logos/anthropic.svg",
  },
  {
    label: "OpenAI",
    value: CredentialType.OPENAI,
    logo: "/logos/openai.svg",
  },
  // Add more credential types here as needed
];

export const CredentialForm = ({ initialData }: CredentialItemProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || CredentialType.GEMINI,
      value: initialData?.value || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEdit) {
        await updateCredential.mutateAsync({
          id: initialData.id!,
          ...values,
        });
      } else {
        await createCredential.mutateAsync(values, {
          onError: (error) => {
            handleError(error);
          },
        });
      }
      router.push("/credentials");
    } catch (error) {
      handleError(error as Error);
    }
  };

  return (
    <>
      {modal}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit" : "Add"} Credential</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your credential information below."
              : "Enter the details for your new credential."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-credential" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-name">Name</FieldLabel>
                    <Input
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                      id="form-rhf-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Name your credential"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Provide a name to easily identify this credential.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-type">
                      Credential Type
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="form-rhf-type"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentialsTypesOptions.map((credential) => (
                          <SelectItem
                            key={credential.value}
                            value={credential.value}
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={credential.logo}
                                alt={credential.label}
                                width={16}
                                height={16}
                              />
                              <span>{credential.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Choose the type of credential you want to add.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="value"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-value">Value</FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-value"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      placeholder="Enter the credential value"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Provide the value for this credential.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="vertical">
            <Button
              form="form-rhf-credential"
              disabled={
                createCredential.isPending || updateCredential.isPending
              }
              type="submit"
            >
              Submit
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/credentials" prefetch>
                Cancel
              </Link>
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credentials } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credentials} />;
};
