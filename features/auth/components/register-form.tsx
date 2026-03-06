"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";
import { authClient } from "../../../lib/auth-client";

const registerSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onsubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        name: values.email,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "An error occurred during registration",
          );
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-login" onSubmit={form.handleSubmit(onsubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isPending}
                >
                  <Image
                    src="/logos/github.svg"
                    width={25}
                    height={25}
                    alt="Github"
                  />
                  Continue with Github
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isPending}
                >
                  <Image
                    src="/logos/google.svg"
                    width={20}
                    height={20}
                    alt="Google"
                  />
                  Continue with Google
                </Button>
              </div>
              <div className="grid gap-6">
                <FieldGroup>
                  <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                          type="email"
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                          placeholder="Enter your email"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Password</FieldLabel>
                        <Input
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter your password"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Confirm Password</FieldLabel>
                        <Input
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="Confirm your password"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Field className="flex flex-col items-center gap-6">
            <Button disabled={isPending} type="submit" form="form-rhf-login">
              Create Account
            </Button>
            <div className="text-center">
              Already have an account?{" "}
              <Link className="underline" href="/login">
                Login
              </Link>
            </div>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
