'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Search, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigationStore } from '@/store/navigation';

interface ShortcutItem {
  keys: string[];
  description: string;
  icon: React.ReactNode;
  action?: () => void;
}

const shortcuts: ShortcutItem[] = [
  {
    keys: ['Escape'],
    description: 'إغلاق النوافذ والحواريات',
    icon: <XCircle className="h-4 w-4 text-amber-500" />,
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'فتح البحث',
    icon: <Search className="h-4 w-4 text-teal-500" />,
  },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const { setView, setSearchQuery } = useNavigationStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K - Open search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      setSearchQuery('');
      setView('search');
      return;
    }

    // Escape - Close this dialog
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      return;
    }
  }, [isOpen, setView, setSearchQuery]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Floating ? button in bottom-left corner */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="اختصارات لوحة المفاتيح"
        title="اختصارات لوحة المفاتيح"
      >
        <HelpCircle className="h-5 w-5" />
      </motion.button>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              اختصارات لوحة المفاتيح
            </DialogTitle>
            <DialogDescription className="sr-only">
              قائمة اختصارات لوحة المفاتيح المتاحة في المنصة
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {shortcut.icon}
                  <span className="text-sm font-medium">{shortcut.description}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {shortcut.keys.map((key, ki) => (
                    <span key={ki} className="flex items-center gap-1">
                      <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border border-border bg-muted px-2 text-xs font-mono font-medium text-muted-foreground shadow-sm">
                        {key}
                      </kbd>
                      {ki < shortcut.keys.length - 1 && (
                        <span className="text-xs text-muted-foreground mx-0.5">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              💡 نصيحة: يمكنك استخدام هذه الاختصارات في أي وقت أثناء تصفح المنصة
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
