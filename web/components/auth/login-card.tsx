"use client";

import type { FormEventHandler } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginCardProps {
  email: string;
  password: string;
  isPasswordVisible: boolean;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
}

export const LoginCard = ({
  email,
  password,
  isPasswordVisible,
  isSubmitting,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onTogglePasswordVisibility,
}: LoginCardProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center">
          <Image
            src="/logo.svg"
            alt="Conexão Treinamento"
            width={64}
            height={64}
            className="rounded-lg"
          />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold">
            Conexão Treinamento
          </CardTitle>
          <CardDescription>
            Sistema de Gerenciamento da Academia
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={onTogglePasswordVisibility}
                aria-label={
                  isPasswordVisible ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Carregando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
