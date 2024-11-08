import { env } from "@/env";
import { useCreateBackInStockNotificationRequest } from "@/hooks/back-in-stock";
import { zodResolver } from "@hookform/resolvers/zod";
import { products } from "@wix/stores";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingButton from "./LoadingButton";
import { Button, ButtonProps } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { requiredString } from "@/lib/validation";

const formSchema = z.object({
  email: requiredString.email(),
});

type FormValues = z.infer<typeof formSchema>;

interface BackInStockNotificationButtonProps extends ButtonProps {
  product: products.Product;
  selectedOptions: Record<string, string>;
}

export default function BackInStockNotificationButton({
  product,
  selectedOptions,
  ...props
}: BackInStockNotificationButtonProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useCreateBackInStockNotificationRequest();

  const onSubmit = (values: FormValues) => {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...props}>在庫あり通知</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>在庫あり通知</DialogTitle>
          <DialogDescription>
            メールアドレスを入力してください。商品が再入荷した際に通知します。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メール</FormLabel>
                  <FormControl>
                    <Input placeholder="メール" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton type="submit" loading={mutation.isPending}>
              通知を登録
            </LoadingButton>
          </form>
        </Form>
        {mutation.isSuccess && (
          <div className="py-2.5 text-green-500">
            ありがとうございます！商品が再入荷した際に通知します。
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
