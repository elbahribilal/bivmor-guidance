// Categories Manager Component
// مكون إدارة التصنيفات

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminCategoriesApi } from '../../services/admin-api';
import { TablePagination } from '../shared/TablePagination';
import type { Category } from '@/types';

export function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catPage, setCatPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    adminCategoriesApi.list().then(r => setCategories(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await adminCategoriesApi.list();
    setCategories(r.data);
  };

  // Re-fetch on focus to keep data fresh
  useEffect(() => {
    const handler = () => { refreshData(); };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">التصنيفات</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">Slug</TableHead>
                  <TableHead className="text-right">المباريات</TableHead>
                  <TableHead className="text-right">المدارس</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.slice((catPage - 1) * PAGE_SIZE, catPage * PAGE_SIZE).map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium text-sm">{cat.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono" dir="ltr">{cat.slug}</TableCell>
                    <TableCell className="text-sm">{cat._count?.competitions || 0}</TableCell>
                    <TableCell className="text-sm">{cat._count?.schools || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TablePagination page={catPage} totalPages={Math.ceil(categories.length / PAGE_SIZE)} total={categories.length} onPageChange={setCatPage} />
      </CardContent>
    </Card>
  );
}
