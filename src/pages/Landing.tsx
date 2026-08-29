import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Package,
  Truck,
  Warehouse,
  Users,
  ArrowRight,
  Boxes,
  ClipboardList,
  MapPin,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Shipment Tracking",
    desc: "Track every shipment from creation to delivery with real-time status updates.",
  },
  {
    icon: ClipboardList,
    title: "Handover Records",
    desc: "Complete chain-of-custody documentation at every transfer point.",
  },
  {
    icon: MapPin,
    title: "Location History",
    desc: "Visual timeline showing every movement and responsible party along the route.",
  },
  {
    icon: CheckCircle,
    title: "State Validation",
    desc: "Enforced state machine prevents invalid status jumps and maintains data integrity.",
  },
];

const stats = [
  { icon: Truck, label: "Suppliers" },
  { icon: Warehouse, label: "Warehouses" },
  { icon: Boxes, label: "Transporters" },
  { icon: Users, label: "Customers" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-4.5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              SupplyTrack
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Supply Chain Management
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Track every good
              <br />
              <span className="text-muted-foreground">from source to destination</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              A complete goods tracking system that records every handover,
              validates every transition, and maintains a full audit trail from
              supplier to customer.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Open Dashboard
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Learn more
              </a>
            </div>
          </motion.div>

          {/* Decorative element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block"
          >
            <div className="relative">
              <div className="w-72 h-72 rounded-full border border-border/60" />
              <div className="absolute inset-6 rounded-full border border-border/40" />
              <div className="absolute inset-12 rounded-full border border-border/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="size-12 text-primary/20" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex items-center gap-3"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-accent">
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for complete visibility
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg text-sm leading-relaxed">
              Every movement is recorded. Every handover is validated. Every
              shipment tells its full story.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                className="rounded-lg border border-border bg-card p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-accent mb-4">
                  <feat.icon className="size-4.5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {feat.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipment flow */}
      <section className="border-t border-border bg-card/30 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              The shipment journey
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-12 flex flex-col sm:flex-row items-stretch gap-0"
          >
            {[
              { label: "Supplier", sub: "Creates & packs" },
              { label: "Warehouse", sub: "Receives & stores" },
              { label: "Transporter", sub: "Picks up & ships" },
              { label: "Customer", sub: "Receives goods" },
            ].map((step, i) => (
              <div key={step.label} className="flex-1 flex items-stretch">
                <div className="flex-1 rounded-lg border border-border bg-card p-5 text-center relative">
                  <div className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.sub}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden sm:flex items-center px-2 text-border">
                    <ArrowRight className="size-4" />
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center text-xs text-muted-foreground"
          >
            {["CREATED", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].map(
              (s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="rounded border border-border bg-card px-2 py-1 font-mono text-[10px] text-foreground">
                    {s}
                  </span>
                  {i < 5 && <ArrowRight className="size-3 text-border" />}
                </span>
              ),
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Start tracking your supply chain
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto">
              Set up suppliers, warehouses, transporters, and customers — then
              create your first shipment in seconds.
            </p>
            <div className="mt-6">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Open Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>SupplyTrack — Supply Chain Goods Tracking</span>
          <span>Built for course project & portfolio</span>
        </div>
      </footer>
    </div>
  );
}
