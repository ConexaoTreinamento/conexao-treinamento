"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createAdministratorMutation } from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";
import { extractFieldErrors, handleHttpError } from "@/lib/error-utils";

const administratorFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "Informe o primeiro nome."),
    lastName: z.string().trim().min(1, "Informe o sobrenome."),
    email: z
      .string()
      .trim()
      .min(1, "Informe o email.")
      .email("Informe um email válido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a senha."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas devem ser iguais.",
  });

export type AdministratorFormValues = z.infer<typeof administratorFormSchema>;

const DEFAULT_VALUES: AdministratorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type AdministratorCreateDialogProps = {
  onCreated?: () => void;
};

const isKnownField = (field: string): field is keyof AdministratorFormValues =>
  Object.hasOwn(DEFAULT_VALUES, field);

export function AdministratorCreateDialog({
  onCreated,
}: AdministratorCreateDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<AdministratorFormValues>({
    resolver: zodResolver(administratorFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const createAdministrator = useMutation({
    ...createAdministratorMutation({ client: apiClient }),
  });

  const closeAndReset = () => {
    setOpen(false);
    form.reset(DEFAULT_VALUES);
    createAdministrator.reset();
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await createAdministrator.mutateAsync({
        client: apiClient,
        body: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
        },
      });

      toast({
        title: "Administrador criado",
        description: "O novo administrador foi cadastrado com sucesso.",
        variant: "success",
      });

      onCreated?.();
      router.refresh();
      closeAndReset();
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          if (isKnownField(field)) {
            form.setError(field, { type: "server", message });
          }
        });
      }

      handleHttpError(
        error,
        "criar administrador",
        "Não foi possível criar o administrador. Tente novamente.",
      );
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset(DEFAULT_VALUES);
          createAdministrator.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-9 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Novo administrador</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo administrador</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="administrator-first-name">Nome</Label>
              <Input
                id="administrator-first-name"
                autoComplete="given-name"
                {...form.register("firstName")}
              />
              {form.formState.errors.firstName ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.firstName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="administrator-last-name">Sobrenome</Label>
              <Input
                id="administrator-last-name"
                autoComplete="family-name"
                {...form.register("lastName")}
              />
              {form.formState.errors.lastName ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="administrator-email">Email</Label>
            <Input
              id="administrator-email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="administrator-password">Senha</Label>
              <Input
                id="administrator-password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="administrator-confirm-password">
                Confirmar senha
              </Label>
              <Input
                id="administrator-confirm-password"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeAndReset}
              disabled={createAdministrator.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createAdministrator.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createAdministrator.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Salvando...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  <span>Salvar</span>
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
