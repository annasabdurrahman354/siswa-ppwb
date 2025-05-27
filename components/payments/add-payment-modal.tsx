"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { PlusCircle, Trash2, Loader2, Edit3, Check, X } from 'lucide-react';
import { formatRupiah } from '@/lib/terbilang';
import { supabase } from '@/lib/supabase';
import { PaymentCategory, PaymentCategoryOption, NewPaymentItem } from '@/types/payment';
import { Siswa } from '@/types/siswa';

interface AddPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  siswa: Siswa | null;
  onPaymentSuccess: () => void;
}

export function AddPaymentModal({ isOpen, onOpenChange, siswa, onPaymentSuccess }: AddPaymentModalProps) {
  const { toast } = useToast();
  const { namaPetugas } = useAuth();

  const [paymentCategories, setPaymentCategories] = useState<PaymentCategory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<PaymentCategoryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const [currentUnitPrice, setCurrentUnitPrice] = useState<number>(0);
  const [liveCalculatedPrice, setLiveCalculatedPrice] = useState<number>(0);

  const [paymentItems, setPaymentItems] = useState<NewPaymentItem[]>([]);
  const [transactionNotes, setTransactionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>("");

  // Fetch payment categories on modal open
  const fetchPaymentCategories = useCallback(async () => {
    setIsFetchingData(true);
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('payment_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      setPaymentCategories(categoriesData || []);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: 'Gagal memuat kategori pembayaran: ' + error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsFetchingData(false);
    }
  }, [toast]);

  // Fetch category options when category is selected
  const fetchCategoryOptions = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setCategoryOptions([]);
      return;
    }

    setIsLoadingOptions(true);
    try {
      const { data: optionsData, error: optionsError } = await supabase
        .from('payment_category_options')
        .select('*')
        .eq('category_id', categoryId)
        .order('description', { ascending: true });
      
      if (optionsError) throw optionsError;
      setCategoryOptions(optionsData || []);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: 'Gagal memuat opsi pembayaran: ' + error.message, 
        variant: 'destructive' 
      });
      setCategoryOptions([]);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentCategories();
      // Reset form
      setPaymentItems([]);
      setSelectedCategoryId('');
      setSelectedOptionId('');
      setCategoryOptions([]);
      setQuantity(1);
      setCurrentUnitPrice(0);
      setLiveCalculatedPrice(0);
      setTransactionNotes('');
      setEditingItemId(null);
      setEditingAmount('');
    }
  }, [isOpen, fetchPaymentCategories]);

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedOptionId('');
    setQuantity(1);
    setCurrentUnitPrice(0);
    setLiveCalculatedPrice(0);
    fetchCategoryOptions(categoryId);
  };

  // Update prices when option or quantity changes
  useEffect(() => {
    const option = categoryOptions.find(opt => opt.id === selectedOptionId);
    if (option) {
      setCurrentUnitPrice(option.amount);
      setLiveCalculatedPrice(option.amount * quantity);
    } else {
      setCurrentUnitPrice(0);
      setLiveCalculatedPrice(0);
    }
  }, [selectedOptionId, quantity, categoryOptions]);

  const handleAddItem = () => {
    const category = paymentCategories.find(cat => cat.id === selectedCategoryId);
    const option = categoryOptions.find(opt => opt.id === selectedOptionId);

    if (!category || !option) {
      toast({ 
        title: 'Peringatan', 
        description: 'Pilih kategori dan opsi pembayaran yang valid.', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (quantity <= 0) {
      toast({ 
        title: 'Peringatan', 
        description: 'Kuantitas harus lebih dari 0.', 
        variant: 'destructive' 
      });
      return;
    }

    const descriptionForNota = `${category.name} - ${option.description}${quantity > 1 ? ` (x${quantity})` : ''}`;
    
    const newItem: NewPaymentItem = {
      client_id: Date.now().toString(),
      categoryOptionId: option.id,
      selectedCategory: category,
      selectedOption: option,
      quantity,
      unitPrice: option.amount,
      calculatedAmount: option.amount * quantity,
      descriptionForNota,
    };
    
    setPaymentItems(prevItems => [...prevItems, newItem]);

    // Reset selection for next item
    setSelectedOptionId('');
    setQuantity(1);
    setCurrentUnitPrice(0);
    setLiveCalculatedPrice(0);
  };

  const handleRemoveItem = (client_id: string) => {
    setPaymentItems(prevItems => prevItems.filter(item => item.client_id !== client_id));
  };
  
  const handleEditAmount = (item: NewPaymentItem) => {
    setEditingItemId(item.client_id);
    setEditingAmount(item.calculatedAmount.toString());
  };

  const handleSaveEditedAmount = (client_id: string) => {
    const newAmount = parseFloat(editingAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      toast({ 
        title: "Error", 
        description: "Jumlah tidak valid.", 
        variant: "destructive" 
      });
      return;
    }
    
    setPaymentItems(items => items.map(item => 
      item.client_id === client_id ? { ...item, calculatedAmount: newAmount } : item
    ));
    setEditingItemId(null);
    setEditingAmount('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingAmount('');
  };

  const totalPembayaran = useMemo(() => {
    return paymentItems.reduce((sum, item) => sum + item.calculatedAmount, 0);
  }, [paymentItems]);

  const handleSubmitTransaction = async () => {
    if (!siswa || !siswa.nispn) {
      toast({ 
        title: 'Error', 
        description: 'Data siswa tidak valid.', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (paymentItems.length === 0) {
      toast({ 
        title: 'Peringatan', 
        description: 'Tambahkan minimal satu item pembayaran.', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (!namaPetugas) {
      toast({ 
        title: 'Error', 
        description: 'Nama petugas tidak valid. Silakan login ulang.', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create payment transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          siswa_nispn: siswa.nispn,
          total_amount: totalPembayaran,
          processed_by_petugas: namaPetugas,
          notes: transactionNotes || null,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;
      if (!transactionData) throw new Error('Gagal membuat header transaksi.');

      const transaction_id = transactionData.id;

      // Create transaction items
      const itemsToInsert = paymentItems.map(item => ({
        transaction_id,
        category_option_id: item.categoryOptionId,
        amount: item.calculatedAmount, // Custom amount (could be edited)
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('payment_transaction_items')
        .insert(itemsToInsert);

      if (itemsError) {
        // Rollback transaction if items insertion fails
        await supabase.from('payment_transactions').delete().match({ id: transaction_id });
        throw itemsError;
      }

      toast({ 
        title: 'Sukses', 
        description: 'Transaksi berhasil disimpan.' 
      });
      onPaymentSuccess();
      onOpenChange(false);

    } catch (error: any) {
      toast({ 
        title: 'Error Transaksi', 
        description: 'Gagal menyimpan transaksi: ' + error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran Baru</DialogTitle>
          {siswa && (
            <DialogDescription>
              Untuk Siswa: {siswa.nama} (NISPN: {siswa.nispn || siswa.nis || 'N/A'})
            </DialogDescription>
          )}
        </DialogHeader>

        {isFetchingData ? (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 py-4 overflow-hidden flex-grow">
            {/* Left: Item Configuration (2/5 width) */}
            <div className="md:col-span-2 space-y-3 md:border-r p-3">
              <h3 className="text-md font-semibold mb-2">Konfigurasi Item</h3>
              
              {/* Category Selection */}
              <div>
                <Label htmlFor="paymentCategory">Kategori Pembayaran</Label>
                <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="paymentCategory">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Option Selection */}
              {selectedCategoryId && (
                <div>
                  <Label htmlFor="categoryOption">Opsi Nominal</Label>
                  <Select 
                    value={selectedOptionId} 
                    onValueChange={setSelectedOptionId} 
                    disabled={isLoadingOptions || categoryOptions.length === 0}
                  >
                    <SelectTrigger id="categoryOption">
                      {isLoadingOptions ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Memuat opsi...
                        </div>
                      ) : (
                        <SelectValue 
                          placeholder={categoryOptions.length === 0 ? "Tidak ada opsi" : "Pilih opsi..."} 
                        />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.description} ({formatRupiah(opt.amount)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Quantity and Price Info */}
              {selectedOptionId && (
                <>
                  <div className='hidden'>
                    <Label htmlFor="unitPrice">Harga Satuan</Label>
                    <Input 
                      id="unitPrice" 
                      type="text" 
                      value={formatRupiah(currentUnitPrice)} 
                      readOnly 
                      className="bg-gray-100" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Kuantitas</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} 
                    />
                  </div>
                  <div>
                    <Label>Subtotal Item</Label>
                    <Input 
                      type="text" 
                      value={formatRupiah(liveCalculatedPrice)} 
                      readOnly 
                      className="bg-gray-100 font-semibold" 
                    />
                  </div>
                </>
              )}

              <Button 
                onClick={handleAddItem} 
                disabled={!selectedOptionId || quantity <= 0 || isLoading || isLoadingOptions} 
                className="w-full mt-3"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> 
                Tambah ke Daftar
              </Button>
            </div>

            {/* Right: Current Items List & Notes (3/5 width) */}
            <div className="md:col-span-3 space-y-3 flex flex-col overflow-hidden p-3">
              <h3 className="text-md font-semibold mb-1">Daftar Item Akan Dibayar</h3>
              <ScrollArea className="flex-grow border rounded-md p-1 min-h-[150px] max-h-[250px] md:max-h-none">
                {paymentItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada item.</p>
                ) : (
                  <ul className="space-y-1 p-1">
                    {paymentItems.map((item) => (
                      <li key={item.client_id} className="flex justify-between items-center p-2 border-b text-sm hover:bg-gray-50 rounded">
                        <div className="flex-grow">
                          <p className="font-medium text-xs">{item.descriptionForNota}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} @ {formatRupiah(item.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 min-w-[150px] justify-end">
                          {editingItemId === item.client_id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={editingAmount}
                                onChange={(e) => setEditingAmount(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditedAmount(item.client_id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                className="h-8 w-20 text-right text-xs"
                                autoFocus
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleSaveEditedAmount(item.client_id)}
                                className="h-6 w-6"
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleCancelEdit}
                                className="h-6 w-6"
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <span 
                              className="font-semibold text-xs w-20 text-right cursor-pointer hover:text-blue-600 flex items-center justify-end" 
                              onClick={() => handleEditAmount(item)}
                              title="Klik untuk edit jumlah"
                            >
                              {formatRupiah(item.calculatedAmount)} 
                              <Edit3 className="h-3 w-3 ml-1 opacity-50" />
                            </span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveItem(item.client_id)} 
                            className="h-7 w-7"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
              <div className="pt-2">
                <Label htmlFor="transactionNotes">Catatan Transaksi (Opsional)</Label>
                <Textarea 
                  id="transactionNotes" 
                  placeholder="Misal: Pembayaran cicilan, potongan khusus, dll." 
                  value={transactionNotes} 
                  onChange={(e) => setTransactionNotes(e.target.value)} 
                  rows={2} 
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-auto pt-4 border-t">
          <div className="flex justify-between items-center w-full">
            <div className="text-lg font-bold">
              Total: {formatRupiah(totalPembayaran)}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>Batal</Button>
              </DialogClose>
              <Button 
                onClick={handleSubmitTransaction} 
                disabled={paymentItems.length === 0 || isLoading || isFetchingData}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simpan Transaksi
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}