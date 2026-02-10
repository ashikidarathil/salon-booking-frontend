'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchPaginatedServices,
  createService,
  updateService,
  toggleServiceStatus,
  uploadServiceImage,
  deleteServiceImage,
  softDeleteService,
  restoreService,
} from '@/features/service/serviceThunks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Pagination from '@/components/pagination/Pagination';
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
  closeLoading,
} from '@/common/utils/swal.utils';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Service } from '@/features/service/service.types';
import { fetchCategories } from '@/features/category/categoryThunks';
import { ImageCropper } from '@/components/cropper/ImageCropper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Upload,
  Trash2,
  X,
  Edit,
  Power,
  Ban,
  RotateCcw,
  ImagePlus,
  Plus,
  Check,
  Eye,
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ITEMS_PER_PAGE = 5;

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  whatIncluded: z.array(z.string()).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const { services, loading, imageLoading, pagination } = useAppSelector((state) => state.service);
  const { categories } = useAppSelector((state) => state.category);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedServiceForImage, setSelectedServiceForImage] = useState<Service | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [whatIncludedInput, setWhatIncludedInput] = useState<string>('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isWhatIncludedModalOpen, setIsWhatIncludedModalOpen] = useState(false);
  const [selectedServiceForWhatIncluded, setSelectedServiceForWhatIncluded] =
    useState<Service | null>(null);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      whatIncluded: [],
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form;

  /* 
   * FIXED: Use useWatch to subscribe to form updates efficiently and avoid 
   * "incompatible library" warnings from React Compiler regarding watch().
   */
  const whatIncluded = useWatch({ 
    control: form.control, 
    name: 'whatIncluded', 
    defaultValue: [] 
  }) || [];

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchPaginatedServices({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
    );
  }, [dispatch, currentPage, searchTerm, categoryFilter, statusFilter]);

  const onSubmit = async (data: ServiceFormData) => {
    showLoading(editingService ? 'Updating service...' : 'Creating service...');

    let result;
    if (editingService) {
      result = await dispatch(updateService({ id: editingService.id, data }));
    } else {
      result = await dispatch(createService(data));
    }

    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess(
        editingService ? 'Service Updated' : 'Service Created',
        editingService ? 'Changes saved successfully' : 'New service added',
      );
      reset();
      setEditingService(null);
      setIsAddDialogOpen(false);
      setWhatIncludedInput('');

      dispatch(
        fetchPaginatedServices({
          page: 1,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
      setCurrentPage(1);
    } else if (result.meta.requestStatus === 'rejected') {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const handleEdit = (svc: Service) => {
    setEditingService(svc);
    reset({
      name: svc.name,
      description: svc.description || '',
      categoryId: svc.categoryId,
      whatIncluded: svc.whatIncluded || [],
    });
    setWhatIncludedInput('');
    setIsAddDialogOpen(true);
  };

  const handleAddWhatIncluded = () => {
    if (whatIncludedInput.trim() && whatIncluded.length < 10) {
      const currentItems = whatIncluded || [];
      setValue('whatIncluded', [...currentItems, whatIncludedInput.trim()]);
      setWhatIncludedInput('');
    }
  };

  const handleRemoveWhatIncluded = (index: number) => {
    const currentItems = whatIncluded || [];
    setValue(
      'whatIncluded',
      currentItems.filter((_, i) => i !== index),
    );
  };

  const handleImageDialogOpen = (svc: Service) => {
    setSelectedServiceForImage(svc);
    setImagePreview(svc.imageUrl || null);
    setSelectedImageFile(null);
    setIsEditingImage(false);
    setIsImageDialogOpen(true);
  };

  const handleEditImageDialogOpen = (svc: Service) => {
    setSelectedServiceForImage(svc);
    setImagePreview(svc.imageUrl || null);
    setSelectedImageFile(null);
    setIsEditingImage(true);
    setIsImageDialogOpen(true);
  };

  const handleOpenWhatIncludedModal = (svc: Service) => {
    setSelectedServiceForWhatIncluded(svc);
    setIsWhatIncludedModalOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setSelectedImageFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleUploadImage = async () => {
    if (!selectedServiceForImage || !selectedImageFile) {
      showError('Failed', 'Please select an image file');
      return;
    }

    showLoading('Uploading image...');
    const result = await dispatch(
      uploadServiceImage({
        serviceId: selectedServiceForImage.id,
        file: selectedImageFile,
      }),
    );
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', 'Image uploaded successfully');
      dispatch(
        fetchPaginatedServices({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
      setIsImageDialogOpen(false);
      setSelectedServiceForImage(null);
      setImagePreview(null);
      setSelectedImageFile(null);
    } else if (result.meta.requestStatus === 'rejected') {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const handleDeleteImage = async (serviceId: string) => {
    const confirmed = await showConfirm(
      'Delete Image?',
      'Are you sure you want to delete this service image?',
      'Delete',
      'Cancel',
      '#ef4444',
    );

    if (!confirmed) return;

    showLoading('Deleting image...');
    const result = await dispatch(deleteServiceImage(serviceId));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Deleted', 'Image deleted successfully');
      dispatch(
        fetchPaginatedServices({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else if (result.meta.requestStatus === 'rejected') {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate';

    const confirmed = await showConfirm(
      `${action} Service?`,
      `Are you sure you want to ${action.toLowerCase()} this service?`,
      `Yes, ${action}`,
      'Cancel',
    );

    if (!confirmed) return;

    showLoading(`${action}ing...`);
    const result = await dispatch(toggleServiceStatus({ id, status: newStatus }));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Success', `Service ${action.toLowerCase()}d`);
      dispatch(
        fetchPaginatedServices({
          page: 1,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else if (result.meta.requestStatus === 'rejected') {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const handleSoftDelete = async (id: string) => {
    const confirmed = await showConfirm(
      'Soft Delete Service?',
      'This will mark the service as deleted (can be restored later). Continue?',
      'Delete',
      'Cancel',
      '#ef4444',
    );

    if (!confirmed) return;

    showLoading('Deleting...');
    const result = await dispatch(softDeleteService(id));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Deleted', 'Service soft-deleted');
      dispatch(
        fetchPaginatedServices({
          page: 1,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else if (result.meta.requestStatus === 'rejected') {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const handleRestore = async (id: string) => {
    showLoading('Restoring...');
    const result = await dispatch(restoreService(id));
    closeLoading();

    if (result.meta.requestStatus === 'fulfilled') {
      showSuccess('Restored', 'Service restored successfully');
      dispatch(
        fetchPaginatedServices({
          page: 1,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
          categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
      );
    } else if (result.meta.requestStatus === 'rejected') {
      const errorMessage = result.payload as string;
      showError('Failed', errorMessage);
    }
  };

  const getStatusBadge = (status: 'ACTIVE' | 'INACTIVE') => {
    return (
      <Badge className={status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
        {status}
      </Badge>
    );
  };

  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || '-';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Service Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage services with search, filters, and detailed information
          </p>
        </div>

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);

            if (!open) {
              setEditingService(null);
              setWhatIncludedInput('');
              reset({
                name: '',
                description: '',
                categoryId: '',
                whatIncluded: [],
              });
            }
          }}
        >
          {' '}
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingService(null);
              }}
            >
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto theme-admin">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService
                  ? 'Update the details of the selected service.'
                  : 'Fill the form below to create a new service.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="pt-4 space-y-6">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input id="name" {...register('name')} placeholder="Hair Cut & Style" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the service..."
                  className="h-20"
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  /* FIXED: Use useWatch for categoryId to avoid React Compiler warning */
                  value={useWatch({ control: form.control, name: 'categoryId' }) || ''}
                  onChange={(e) => setValue('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {capitalizeFirst(cat.name)}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              {/* What's Included Section */}
              <div className="pt-6 border-t">
                <Label className="text-base font-semibold">What's Included (optional)</Label>
                <p className="mt-1 mb-4 text-sm text-gray-500">
                  Add bullet points of what's included in this service (1-10 items)
                </p>

                <div className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder="Add an item (e.g., Free hair consultation)"
                    value={whatIncludedInput}
                    onChange={(e) => setWhatIncludedInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWhatIncluded();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddWhatIncluded}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {whatIncluded && whatIncluded.length > 0 && (
                  <div className="space-y-2">
                    {whatIncluded.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWhatIncluded(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {whatIncluded && whatIncluded.length >= 10 && (
                  <p className="mt-2 text-xs text-yellow-600">Maximum 10 items reached</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">{editingService ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters - UPDATED WITH DROPDOWNS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="search" className="block mb-2 text-sm font-medium">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="min-w-[180px]">
            <Label htmlFor="category-filter" className="block mb-2 text-sm font-medium">
              Category
            </Label>
            <div className="relative">
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {capitalizeFirst(cat.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Filter Dropdown */}
          <div className="min-w-[150px]">
            <Label htmlFor="status-filter" className="block mb-2 text-sm font-medium">
              Status
            </Label>
            <div className="relative">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as 'ACTIVE' | 'INACTIVE' | 'ALL');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isWhatIncludedModalOpen} onOpenChange={setIsWhatIncludedModalOpen}>
        <DialogContent className="sm:max-w-lg theme-admin">
          <DialogHeader>
            <DialogTitle>What's Included - {selectedServiceForWhatIncluded?.name}</DialogTitle>
            <DialogDescription>All items included in this service</DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedServiceForWhatIncluded?.whatIncluded &&
            selectedServiceForWhatIncluded.whatIncluded.length > 0 ? (
              <div className="space-y-2">
                {selectedServiceForWhatIncluded.whatIncluded.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded bg-gray-50"
                  >
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">No items included in this service</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-lg theme-admin">
          <DialogHeader>
            <DialogTitle>
              {isEditingImage && selectedServiceForImage?.imageUrl
                ? `Edit Image - ${selectedServiceForImage?.name}`
                : `Upload Image - ${selectedServiceForImage?.name}`}
            </DialogTitle>
            <DialogDescription>
              {isEditingImage && selectedServiceForImage?.imageUrl
                ? 'Update the image for this service'
                : 'Upload a new image for this service'}
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 space-y-6">
            {/* Image Preview */}
            <div className="relative w-full h-64 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImageFile(null);
                    }}
                    className="absolute p-1 text-white bg-red-500 rounded-full top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* File Input */}
            <div>
              <Label htmlFor="image-input">
                {isEditingImage ? 'Select New Image File' : 'Select Image File'}
              </Label>
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="mt-2"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadImage}
                disabled={!selectedImageFile || imageLoading}
                className="gap-2"
              >
                {imageLoading
                  ? isEditingImage
                    ? 'Updating...'
                    : 'Uploading...'
                  : isEditingImage
                    ? 'Update Image'
                    : 'Upload Image'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      {imagePreview && (
        <ImageCropper
          open={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={imagePreview}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 mx-auto mb-6 border-t-4 border-b-4 rounded-full animate-spin border-primary" />
              <p className="text-2xl">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="py-32 text-center">
              <h2 className="text-3xl font-bold">No Services Found</h2>
              <p className="mt-2 text-xl text-muted-foreground">
                {searchTerm ? 'No matches for your search' : 'Add your first service above'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>What's Included</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deleted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((svc) => (
                      <TableRow key={svc.id}>
                        <TableCell>
                          {svc.imageUrl ? (
                            <div className="relative group">
                              <img
                                src={svc.imageUrl}
                                alt={svc.name}
                                className="object-cover w-12 h-12 rounded"
                              />
                              <div className="absolute top-0 right-0 flex gap-1 transition-opacity opacity-0 group-hover:opacity-100">
                                {/* Edit Image Button */}
                                <button
                                  onClick={() => handleEditImageDialogOpen(svc)}
                                  className="bg-blue-500 text-white rounded-full p-0.5 hover:bg-blue-600"
                                  title="Edit Image"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                {/* Delete Image Button */}
                                <button
                                  onClick={() => handleDeleteImage(svc.id)}
                                  className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                  title="Delete Image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="w-8 h-8"
                                      onClick={() => handleImageDialogOpen(svc)}
                                    >
                                      <ImagePlus className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="theme-admin">
                                    Upload Image
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {svc.name.charAt(0).toUpperCase() + svc.name.slice(1).toLowerCase()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {capitalizeFirst(getCategoryName(svc.categoryId))}
                        </TableCell>
                        <TableCell className="text-sm">
                          {svc.whatIncluded && svc.whatIncluded.length > 0 ? (
                            <div className="space-y-2">
                              {/* Show first 2 items only */}
                              {svc.whatIncluded.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-start gap-1">
                                  <span className="text-gray-400">•</span>
                                  <span className="text-xs truncate">{item.split(':')[0]}</span>
                                </div>
                              ))}
                              {/* Show More Button */}
                              {svc.whatIncluded.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 p-0 text-xs text-blue-600 hover:text-blue-700"
                                  onClick={() => handleOpenWhatIncludedModal(svc)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Show All ({svc.whatIncluded.length})
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(svc.status)}</TableCell>
                        <TableCell>
                          {svc.isDeleted ? (
                            <Badge variant="destructive">Yes</Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="hidden md:flex items-center justify-end gap-1.5">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => handleEdit(svc)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Edit Service
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => handleImageDialogOpen(svc)}
                                  >
                                    <ImagePlus className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  Upload Image
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8"
                                    onClick={() => handleToggleStatus(svc.id, svc.status)}
                                  >
                                    {svc.status === 'ACTIVE' ? (
                                      <Ban className="w-4 h-4 text-red-600" />
                                    ) : (
                                      <Power className="w-4 h-4 text-green-600" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="theme-admin">
                                  {svc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Service
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {svc.isDeleted ? (
                              <Button
                                variant="default"
                                size="sm"
                                className="ml-2 text-white bg-green-600 hover:bg-green-700"
                                onClick={() => handleRestore(svc.id)}
                              >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Restore
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="ml-2 text-white bg-red-600 hover:bg-red-700"
                                onClick={() => handleSoftDelete(svc.id)}
                              >
                                <Ban className="mr-1.5 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 border-t">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
