import { motion } from "framer-motion";

export interface Step {
  title: string;
  body: string;
}

const StepList = ({ steps }: { steps: Step[] }) => (
  <div className="grid gap-5">
    {steps.map((s, i) => (
      <motion.div
        key={s.title}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.06 }}
        className="flex gap-5 p-6 rounded-lg bg-card border border-border"
      >
        <span className="font-display text-4xl text-primary text-glow leading-none min-w-[3rem]">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="font-display text-2xl text-foreground mb-1">{s.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

export default StepList;