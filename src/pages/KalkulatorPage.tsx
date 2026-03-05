import { DateConverter } from '../components/DateConverter';
import { DateCalculator } from '../components/DateCalculator';

export function KalkulatorPage() {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Konwerter Dat</h2>

      <DateConverter />
        <DateCalculator />
    </section>
  );
}
