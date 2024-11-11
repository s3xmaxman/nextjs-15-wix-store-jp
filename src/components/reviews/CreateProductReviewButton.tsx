"use client";

import { members } from "@wix/members";
import { products } from "@wix/stores";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import CreateProductReviewDialog from "./CreateProductReviewDialog";

interface CreateProductReviewButtonProps {
  product: products.Product;
  loggedInMember: members.Member | null;
}

export default function CreateProductReviewButton({
  product,
  loggedInMember,
}: CreateProductReviewButtonProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowReviewDialog(true)}
        disabled={!loggedInMember}
      >
        {loggedInMember ? "Write a review" : "Log in to write a review"}
      </Button>
      <CreateProductReviewDialog
        product={product}
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onSubmit={() => {
          setShowReviewDialog(false);
          setShowConfirmationDialog(true);
        }}
      />
      <ReviewSubmittedDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      />
    </>
  );
}

interface ReviewSubmittedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReviewSubmittedDialog({
  open,
  onOpenChange,
}: ReviewSubmittedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レビューが既に存在します</DialogTitle>
          <DialogDescription>
            この商品に対して既にレビューを書いています。一つの商品につき一つのレビューのみ書けます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
