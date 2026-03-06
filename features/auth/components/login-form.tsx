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

import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";
import Link from "next/link";
import { authClient } from "../../../lib/auth-client";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onsubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/"
    }, {
      onSuccess: () => {
        router.push("/");
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "An error occurred while logging in");
      }
    })
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to your account to continue.</CardDescription>
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
                  Continue with Github
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  disabled={isPending}
                >
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
                          disabled={isPending}
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
                </FieldGroup>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Field className="flex flex-col items-center gap-6">
            <Button disabled={isPending} type="submit" form="form-rhf-login">
              Login
            </Button>
            <div className="text-center">
              Don&#39;t have an account? <Link className="underline" href="/signup">Sign up</Link>
            </div>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
