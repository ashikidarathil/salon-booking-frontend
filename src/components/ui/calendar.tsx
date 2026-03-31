import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center mb-4',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground absolute left-1 z-20 flex items-center justify-center border-border/40',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground absolute right-1 z-20 flex items-center justify-center border-border/40',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex w-full justify-between',
        weekday:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex justify-center items-center',
        week: 'flex w-full mt-2 justify-between',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([data-day-selected])]:bg-accent first:[&:has([data-day-selected])]:rounded-l-md last:[&:has([data-day-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        chevron: 'inline-block fill-primary text-primary h-5 w-5',
        ...classNames,
      }}
      components={{
        PreviousMonthButton: ({ className, ...props }) => (
          <button
            {...props}
            type="button"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'h-8 w-8 p-0 absolute left-1 z-20 flex items-center justify-center transition-opacity hover:opacity-70',
              className,
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ),
        NextMonthButton: ({ className, ...props }) => (
          <button
            {...props}
            type="button"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'h-8 w-8 p-0 absolute right-1 z-20 flex items-center justify-center transition-opacity hover:opacity-70',
              className,
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        ),
        Chevron: ({ orientation }) => {
          const isLeft = orientation === 'left';
          return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d={isLeft ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
            </svg>
          );
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
