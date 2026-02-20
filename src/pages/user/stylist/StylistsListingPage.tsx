'use client';

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPublicStylists } from '@/features/stylistInvite/stylistInviteThunks';
import { APP_ROUTES } from '@/common/constants/app.routes';
import { LoadingGate } from '@/components/common/LoadingGate';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/pagination/Pagination';
import { Icon } from '@iconify/react';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const ITEMS_PER_PAGE = 9;

export default function StylistsListingPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { stylists, loading, error, pagination } = useAppSelector((state) => state.stylistInvite);

  const { selectedBranch } = useAppSelector((state) => state.branch);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [positionFilter, setPositionFilter] = useState('all');

  useEffect(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    if (!savedBranch) {
      localStorage.setItem('returnPath', APP_ROUTES.USER.STYLISTS);
      navigate('/branches');
    }
  }, [navigate]);

  const loadStylists = useCallback(() => {
    if (!selectedBranch?.id) return;

    dispatch(
      fetchPublicStylists({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        branchId: selectedBranch.id,
        position: positionFilter === 'all' ? undefined : positionFilter,
      }),
    );
  }, [dispatch, currentPage, search, selectedBranch?.id, positionFilter]);

  useEffect(() => {
    if (selectedBranch?.id) {
      loadStylists();
    }
  }, [loadStylists, selectedBranch?.id, positionFilter, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const getPositionLabel = (pos?: string) => {
    switch (pos) {
      case 'SENIOR':
        return 'Senior Stylist';
      case 'JUNIOR':
        return 'Junior Stylist';
      case 'TRAINEE':
        return 'Trainee Stylist';
      default:
        return 'Stylist';
    }
  };

  const filterButtons = [
    { label: 'All Stylists', value: 'all' },
    { label: 'Senior Stylists', value: 'SENIOR' },
    { label: 'Junior Stylists', value: 'JUNIOR' },
    { label: 'Trainees', value: 'TRAINEE' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col w-full">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
              Our Expert Stylists
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Meet our talented team of professional stylists. Each brings unique expertise and
              passion to create your perfect look.
            </p>

            <div className="flex flex-col sm:flex-row items-center max-w-xl mx-auto bg-white rounded-full border shadow-sm p-2 gap-2">
              <div className="flex-1 flex items-center px-4 w-full">
                <Icon icon="lucide:search" className="size-5 text-muted-foreground mr-3" />
                <input
                  type="text"
                  placeholder="Search stylists..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm h-10 placeholder:text-muted-foreground/70"
                />
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="w-full sm:w-auto">
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger className="border-none shadow-none focus:ring-0 w-full sm:w-[160px] rounded-full bg-transparent">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Positions</SelectItem>
                    <SelectItem value="SENIOR">Senior Stylist</SelectItem>
                    <SelectItem value="JUNIOR">Junior Stylist</SelectItem>
                    <SelectItem value="TRAINEE">Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 py-8">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={positionFilter === btn.value ? 'secondary' : 'ghost'}
                className={`rounded-full px-6 transition-all duration-300 ${
                  positionFilter === btn.value
                    ? 'bg-primary/15 text-primary hover:bg-primary/20 hover:text-primary border-primary/20 border shadow-none'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setPositionFilter(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          <LoadingGate
            loading={loading && stylists.length === 0}
            error={error}
            data={stylists}
            emptyMessage="No stylists found matching your criteria."
            emptyIcon="hugeicons:search-not-found"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stylists.map((stylist) => (
                <Card
                  key={stylist.id}
                  className="group overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 pt-0 flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={
                        stylist.profilePicture ||
                        'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
                      }
                      alt={stylist.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {stylist.rating && stylist.rating > 4.8 && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-[#4CC9F0] hover:bg-[#4CC9F0]/90 text-white border-none shadow-sm rounded-md px-2.5 py-1">
                          Top Rated
                        </Badge>
                      </div>
                    )}
                    <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-muted-foreground hover:text-destructive hover:bg-white transition-colors">
                      <Icon icon="solar:heart-linear" className="size-5" />
                    </button>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <CardTitle className="text-xl mb-1">{stylist.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5">
                          {getPositionLabel(stylist.position)}{' '}
                          <span className="text-muted-foreground/50">•</span> {stylist.experience}{' '}
                          years exp.
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon
                            key={i}
                            icon={
                              i < Math.floor(stylist.rating || 5)
                                ? 'solar:star-bold'
                                : 'solar:star-bold-duotone'
                            }
                            className={`size-4 ${
                              i >= Math.floor(stylist.rating || 5) ? 'text-amber-400/30' : ''
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold ml-1">
                        {(stylist.rating || 5.0).toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">({stylist.reviewCount})</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stylist.assignedServices && stylist.assignedServices.length > 0 ? (
                        stylist.assignedServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                          >
                            {service.charAt(0).toUpperCase() + service.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                          {stylist.specialization}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon icon="solar:map-point-bold" className="size-4 mr-1.5 text-primary" />
                      {stylist.branchName || 'N/A'}
                    </div>
                  </CardContent>

                  <CardFooter className="gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-border/60"
                      onClick={() =>
                        navigate(APP_ROUTES.USER.STYLIST_DETAILS.replace(':stylistId', stylist.id))
                      }
                    >
                      View Profile
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      onClick={() =>
                        navigate(APP_ROUTES.USER.STYLIST_DETAILS.replace(':stylistId', stylist.id))
                      }
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-16">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </LoadingGate>
        </section>
      </main>

      <Footer />
    </div>
  );
}
