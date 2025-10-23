"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useLocale } from "@/app/contexts/index";

const SignInPage = () => {
  const { locale } = useLocale();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{locale("auth.sign_in.title")}</CardTitle>
          <CardDescription>
            {locale("auth.sign_in.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            {locale("auth.sign_in.github")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            {locale("auth.sign_in.google")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
