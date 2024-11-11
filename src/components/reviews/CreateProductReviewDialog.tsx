import { products } from "@wix/stores";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface CreateProductReviewDialogProps {
  product: products.Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export default function CreateProductReviewDialog({
  product,
  open,
  onOpenChange,
  onSubmit,
}: CreateProductReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レビューを書き込む</DialogTitle>
          <DialogDescription>
            Your review has been submitted successfully. It will be visible once
            it has been approved by our team.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
