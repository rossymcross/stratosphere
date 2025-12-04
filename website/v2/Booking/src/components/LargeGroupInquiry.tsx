import React from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Calendar, Check, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { cn } from './ui/utils';

const activityOptions = [
  { id: 'bowling', label: 'Bowling' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'axe-throwing', label: 'Axe Throwing' },
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'nerf', label: 'Nerf' },
  { id: 'other', label: 'Other' },
];

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

const formSchema = z.object({
  contactName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(14, { message: "Please enter a valid phone number" }), // (555) 555-5555 is 14 chars
  companyName: z.string().min(1, { message: "Company/Group name is required" }),
  guestCount: z.string()
    .min(1, "Guest count is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 16, {
      message: "Group size must be 16 or more",
    }),
  preferredDate: z.string().min(1, { message: "Preferred date is required" }),
  preferredTime: z.string().min(1, { message: "Preferred time is required" }),
  activities: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must select at least one activity.",
  }),
  specialRequests: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LargeGroupInquiryProps {
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export const LargeGroupInquiry = ({ onBack, onSubmitSuccess }: LargeGroupInquiryProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      email: "",
      phone: "",
      companyName: "",
      guestCount: "",
      preferredDate: "",
      preferredTime: "",
      activities: [],
      specialRequests: "",
    },
    mode: "onChange",
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", data);
    onSubmitSuccess();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-24 pb-12 px-4 md:px-8 relative">
      
      {/* Back Button - Moved to Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="hidden md:inline font-montserrat tracking-wider text-sm">BACK</span>
        </button>
      </div>

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto mb-8 relative">
        <div className="text-center px-12">
          <h1 className="font-montserrat font-black text-3xl md:text-5xl text-white uppercase tracking-wider mb-4 drop-shadow-[0_0_15px_rgba(113,210,235,0.3)]">
            Let's plan your <span className="text-[#71D2EB]">event!</span>
          </h1>
          <p className="font-montserrat text-white/80 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Your group qualifies for dedicated event planning. Fill out the form below and our team will contact you within 24 hours.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-[#041C2C]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-10 shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Name */}
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Contact Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Jane Doe" 
                          {...field} 
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="jane@example.com" 
                          {...field} 
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Phone *</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="(555) 123-4567" 
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={14}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company / Group Name */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Company / Group Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Acme Corp / The Smith Party" 
                          {...field} 
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expected Guests */}
                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Expected Guests (Min 16) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="20" 
                          {...field} 
                          min={16}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Time */}
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Preferred Time *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 7:00 PM" 
                          {...field} 
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 h-12 rounded-xl transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preferred Date(s) */}
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 font-montserrat tracking-wide">Preferred Date(s) *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ideally looking for a Friday evening in December, but flexible..." 
                        {...field} 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 min-h-[80px] rounded-xl transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interested Activities */}
              <FormField
                control={form.control}
                name="activities"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-white/90 font-montserrat tracking-wide">Interested Activities *</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activityOptions.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => {
                            const currentValues = field.value || [];
                            const isChecked = currentValues.includes(activity.id);
                            if (isChecked) {
                              field.onChange(currentValues.filter((value) => value !== activity.id));
                            } else {
                              field.onChange([...currentValues, activity.id]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={field.value?.includes(activity.id)}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              return checked
                                ? field.onChange([...currentValues, activity.id])
                                : field.onChange(
                                    currentValues.filter(
                                      (value) => value !== activity.id
                                    )
                                  )
                            }}
                            className="border-white/50 data-[state=checked]:bg-[#71D2EB] data-[state=checked]:border-[#71D2EB] data-[state=checked]:text-[#041C2C]"
                          />
                          <span className="font-normal text-white cursor-pointer w-full text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pt-0.5">
                            {activity.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Special Requests */}
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 font-montserrat tracking-wide">Special Requests</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Dietary restrictions, accessibility needs, specific themes..." 
                        {...field} 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#71D2EB] focus:ring-[#71D2EB]/20 min-h-[100px] rounded-xl transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={!isValid || isSubmitting}
                className={cn(
                  "w-full h-14 text-lg font-bold tracking-wider uppercase rounded-full transition-all duration-300",
                  isValid 
                    ? "bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] hover:-translate-y-1" 
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Request"
                )}
              </Button>

            </form>
          </Form>
        </div>
      </div>
      {/* Page Number */}
      <div className="absolute bottom-8 left-8 z-20 text-white/10 font-black text-6xl md:text-8xl pointer-events-none select-none font-montserrat">
        02
      </div>
    </div>
  );
};
