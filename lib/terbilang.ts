const satuan = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
];
const belasan = [
  "sepuluh",
  "sebelas",
  "dua belas",
  "tiga belas",
  "empat belas",
  "lima belas",
  "enam belas",
  "tujuh belas",
  "delapan belas",
  "sembilan belas",
];
const puluhan = [
  "",
  "",
  "dua puluh",
  "tiga puluh",
  "empat puluh",
  "lima puluh",
  "enam puluh",
  "tujuh puluh",
  "delapan puluh",
  "sembilan puluh",
];
const ribuan = ["", "ribu", "juta", "miliar", "triliun"];

function toWords(n: number): string {
  if (n < 10) return satuan[n];
  if (n < 20) return belasan[n - 10];
  if (n < 100)
    return puluhan[Math.floor(n / 10)] + (n % 10 > 0 ? " " + satuan[n % 10] : "");
  if (n < 1000)
    return (
      satuan[Math.floor(n / 100)] +
      " ratus" +
      (n % 100 > 0 ? " " + toWords(n % 100) : "")
    );
  return ""; // Simplified for this example, extend for larger numbers
}

export function terbilang(n: number): string {
  if (n === 0) return "nol";
  let result = "";
  let i = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      let chunkWords = toWords(chunk);
      if (chunk === 1 && i === 1) chunkWords = "seribu"; // Handle "seribu"
      else if (ribuan[i]) chunkWords += " " + ribuan[i];
      result = chunkWords + (result ? " " + result : "");
    }
    n = Math.floor(n / 1000);
    i++;
  }
  return result.trim().replace(/\s+/g, " ") + " Rupiah";
}

export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}