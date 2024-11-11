import { members } from "@wix/members";
import { products } from "@wix/stores";
import { useState } from "react";
import { Button } from "../ui/button";
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
    </>
  );
}
