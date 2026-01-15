import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@shared/routes";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { data: user, isLoading: isLoadingUser } = useUser();
  const [, setLocation] = useLocation();

  if (isLoadingUser) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (user) {
    setLocation(user.role === "admin" ? "/admin" : "/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50"></div>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white shadow-xl shadow-primary/20 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">GateGuard</h1>
          <p className="text-muted-foreground">Secure access management for your community.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Login</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <RegisterForm onSuccess={() => setActiveTab("login")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    login(data);
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your phone number to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} className="h-11 bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="h-11 bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" 
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: register, isPending } = useRegister();
  
  const form = useForm({
    resolver: zodResolver(api.auth.register.input),
    defaultValues: {
      name: "",
      phone: "",
      flatNumber: "",
      password: "",
      role: "resident" as const,
    },
  });

  const onSubmit = (data: any) => {
    register(data, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Register as a new resident</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} className="h-10 bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} className="h-10 bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flat No.</FormLabel>
                    <FormControl>
                      <Input placeholder="A-101" {...field} className="h-10 bg-background/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="h-10 bg-background/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full mt-2 h-11" 
              disabled={isPending}
            >
              {isPending ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
