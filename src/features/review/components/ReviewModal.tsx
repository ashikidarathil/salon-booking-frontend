import React, { useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { createReviewThunk } from '@/features/review/state/review.thunks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { showToast, showSuccess, showApiError } from '@/common/utils/swal.utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('warning', 'Rating Required');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createReviewThunk({
          bookingId,
          rating,
          comment,
        }),
      ).unwrap();
      showSuccess('Review Submitted', 'Thank you for your feedback!');
      onSuccess?.();
      onClose();
    } catch (error) {
      showApiError(error, 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your appointment? Your feedback helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  className={`h-10 w-10 ${
                    (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600">
            {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Comments (Optional)</label>
          <Textarea
            placeholder="Share more about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
