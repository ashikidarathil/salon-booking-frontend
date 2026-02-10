'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { fetchNearestBranches, fetchPublicPaginatedBranches } from '@/features/branch/branch.thunks';
import { setBranchSelected } from '@/features/branch/branch.slice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import { showSuccess } from '@/common/utils/swal.utils';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import Pagination from '@/components/pagination/Pagination';
import type { Branch, NearestBranch } from '@/features/branch/branch.types';

export default function BranchesListingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { nearestBranches, branches, loading, pagination } = useAppSelector((state) => state.branch);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasLocation, setHasLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setTimeout(() => {
        setLocationError('Geolocation is not supported by your browser');
      }, 0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`User location: ${latitude}, ${longitude}`);

        dispatch(fetchNearestBranches({ latitude, longitude })).then(() => {
          setHasLocation(true);
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [dispatch]);

  // Effect for fetching branches when search or page changes (if not using location)
  useEffect(() => {
    if (!hasLocation) {
      dispatch(
        fetchPublicPaginatedBranches({
          page: currentPage,
          limit: 9,
          search: search || undefined,
        }),
      );
    }
  }, [dispatch, currentPage, search, hasLocation]);

  const filteredBranches = useMemo(() => {

    const branchesToFilter = hasLocation && nearestBranches.length > 0 
      ? nearestBranches 
      : branches;

    if (!search.trim()) {
      return branchesToFilter;
    }

    const searchLower = search.toLowerCase();
    return branchesToFilter.filter((branch) => {
      return (
        branch.name.toLowerCase().includes(searchLower) ||
        branch.address?.toLowerCase().includes(searchLower) ||
        (branch.phone && branch.phone.includes(search))
      );
    });
  }, [search, hasLocation, nearestBranches, branches]);

  const handleSelectBranch = (branch: Branch) => {
    dispatch(setBranchSelected(branch));

    showSuccess('Success!', `${branch.name} has been selected`, 1500);

    setTimeout(() => {
      const returnPath = localStorage.getItem('returnPath');
      if (returnPath) {
        localStorage.removeItem('returnPath');
        navigate(returnPath);
      } else {
        navigate('/');
      }
    }, 500);
  };

  if (loading && filteredBranches.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground">
              {hasLocation ? 'Finding nearest branches...' : 'Loading branches...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8 mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Find Our Branches</h1>
            <p className="text-lg text-muted-foreground">
              {hasLocation ? '📍 Showing branches nearest to you' : 'Browse our salons'}
            </p>
            {locationError && (
              <div className="p-3 mt-3 text-sm text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
                <Icon icon="solar:info-circle-bold" className="inline mr-2" />
                {locationError}
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Icon
                icon="solar:magnifier-bold"
                className="absolute pointer-events-none left-3 top-3 size-5 text-muted-foreground"
              />
              <Input
                placeholder="Search by name, address, or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 pl-10 h-11"
              />
            </div>
          </div>

          {/* Branches Grid */}
          {filteredBranches && filteredBranches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch: Branch, index: number) => (
                <Card
                  key={branch.id || index}
                  className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col flex-1 p-6">
                    {'distance' in branch && (
                      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold w-fit">
                        <Icon icon="solar:map-point-bold" className="size-4" />
                        {((branch as NearestBranch).distance / 1000).toFixed(1)} km away
                      </div>
                    )}

                    <h3 className="mb-3 text-xl font-bold text-gray-900">{branch.name}</h3>

                    {/* Address */}
                    <div className="flex gap-3 mb-4 text-sm text-muted-foreground">
                      <Icon icon="solar:home-bold" className="flex-shrink-0 size-5 text-primary" />
                      <p className="line-clamp-2">{branch.address}</p>
                    </div>

                    {/* Phone */}
                    {branch.phone && (
                      <div className="flex gap-3 mb-6 text-sm text-muted-foreground">
                        <Icon
                          icon="solar:phone-bold"
                          className="flex-shrink-0 size-5 text-primary"
                        />
                        <p>{branch.phone}</p>
                      </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Select Button */}
                    <Button
                      onClick={() => handleSelectBranch(branch)}
                      className="w-full font-semibold text-white bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      <Icon icon="solar:check-circle-bold" className="mr-2 size-5" />
                      Select Branch
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Icon
                icon="solar:map-point-bold"
                className="mx-auto mb-4 size-20 text-muted-foreground/30"
              />
              <p className="mb-2 text-lg text-muted-foreground">
                {search ? 'No branches found matching your search' : 'No branches available'}
              </p>
              {search && (
                <Button variant="outline" onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }} className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Results Count */}
          {filteredBranches.length > 0 && (
            <div className="mt-8 text-sm text-center text-muted-foreground">
              Showing {filteredBranches.length} branch
              {filteredBranches.length !== 1 ? 'es' : ''}
              {!hasLocation && pagination && ` of ${pagination.totalItems}`}
            </div>
          )}

          {/* Pagination */}
          {!hasLocation && pagination && pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
