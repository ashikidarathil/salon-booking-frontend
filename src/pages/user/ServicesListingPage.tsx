'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { fetchBranchServicesPublicPaginated } from '@/features/branchService/branchService.thunks';
import { fetchPublicCategories } from '@/features/category/categoryThunks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import Pagination from '@/components/pagination/Pagination';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function ServicesListingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { selectedBranch } = useAppSelector((state) => state.branch);
  const { services, pagination, loading } = useAppSelector((state) => state.branchService);
  const { categories } = useAppSelector((state) => state.category);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const savedBranch = localStorage.getItem('selectedBranch');

    if (!savedBranch) {
      localStorage.setItem('returnPath', '/services');
      navigate('/branches');
    }
  }, [navigate]);

  useEffect(() => {
    dispatch(fetchPublicCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBranch?.id) {
      dispatch(
        fetchBranchServicesPublicPaginated({
          branchId: selectedBranch.id,
          page: currentPage,
          limit: 9,
          search: search || undefined,
          categoryId: selectedCategory || undefined,
        }),
      );
    }
  }, [dispatch, selectedBranch, search, selectedCategory, currentPage]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? '' : categoryId);
    setCurrentPage(1);
  };

  const handleViewDetails = (serviceId: string) => {
    navigate(`/branches/${selectedBranch!.id}/services/${serviceId}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden text-center bg-accent md:py-20 ">
          <div className="absolute top-0 w-full h-full -translate-x-1/2 pointer-events-none left-1/2 bg-gradient-to-b from-white/50 to-transparent" />
          <div className="container relative z-10 flex flex-col items-center px-4 mx-auto">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl text-foreground font-heading">
              Our Services
            </h1>
            <p className="max-w-2xl mx-auto mb-10 text-lg text-muted-foreground">
              {selectedBranch?.name
                ? `Available at ${selectedBranch.name}`
                : 'Discover premium salon services tailored to enhance your style and beauty.'}
            </p>
            <div className="flex items-center w-full max-w-2xl gap-2 p-2 mx-auto border rounded-full shadow-sm bg-background border-border">
              <div className="pl-4 text-muted-foreground">
                <Icon icon="solar:magnifer-linear" className="size-5" />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 h-10 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/70"
              />
              <div className="w-px h-6 mx-2 bg-border" />
              <Select value={selectedCategory || 'all'} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0 bg-transparent h-10 text-muted-foreground font-normal">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="z-[2000] bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="container px-4 py-12 mx-auto space-y-12">
          {/* Category Carousel */}
          <div className="relative w-full max-w-4xl px-12 mx-auto">
            <Carousel
              opts={{
                align: 'start',
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                <CarouselItem className="pl-2 md:pl-4 basis-auto">
                  <Button
                    variant={!selectedCategory ? 'default' : 'ghost'}
                    className={
                      !selectedCategory
                        ? 'rounded-full px-6 shadow-md shadow-primary/20'
                        : 'rounded-full px-6 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                    }
                    onClick={() => handleCategoryFilter('all')}
                  >
                    All Services
                  </Button>
                </CarouselItem>
                {categories &&
                  categories.map((cat) => (
                    <CarouselItem key={cat.id} className="pl-2 md:pl-4 basis-auto">
                      <Button
                        variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                        className={
                          selectedCategory === cat.id
                            ? 'rounded-full px-6 shadow-md shadow-primary/20'
                            : 'rounded-full px-6 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                        }
                        onClick={() => handleCategoryFilter(cat.id)}
                      >
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </Button>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          </div>

          {/* Services Grid */}
          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card
                  key={service.serviceId}
                  className="overflow-hidden transition-colors border-border/60 hover:border-primary/50 group"
                >
                  {/* Service Image */}
                  <div className="relative flex items-center justify-center h-64 p-8 overflow-hidden bg-muted/30">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-white rounded-lg shadow-sm opacity-50">
                        <Icon
                          icon="solar:scissors-square-bold-duotone"
                          className="size-16 text-muted-foreground/30"
                        />
                      </div>
                    )}
                  </div>

                  {/* Service Details */}
                  <div className="p-6 pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold">{service.name.charAt(0).toUpperCase() + service.name.slice(1)}</h3>
                      {service.categoryName && (
                        <Badge className="px-2 font-normal border-none rounded-sm bg-primary text-primary hover:bg-primary/70">
                          {service.categoryName}
                        </Badge>
                      )}
                    </div>

                    {service.description && (
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    {service.duration && (
                      <div className="flex items-center mb-4 text-sm text-muted-foreground">
                        <Icon icon="solar:clock-circle-linear" className="mr-2 size-4" />
                        <span>{service.duration} minutes</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-foreground">
                        {service.price ? `₹${service.price.toLocaleString('en-IN')}` : 'Price on request'}
                      </span>
                      <Button
                        className="shadow-md bg-primary hover:bg-primary/90 shadow-primary/20"
                        onClick={() => handleViewDetails(service.serviceId)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="flex items-center justify-center mx-auto mb-6 rounded-full size-24 bg-muted/30">
                <Icon
                  icon="solar:bag-smile-bold-duotone"
                  className="size-12 text-muted-foreground/50"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold">No services match your search criteria</h3>
              <p className="mb-6 text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
              {(search || selectedCategory) && (
                <Button onClick={handleClearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
