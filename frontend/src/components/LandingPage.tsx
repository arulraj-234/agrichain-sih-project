// import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  DollarSign,
  QrCode,
  Tractor,
  Truck,
  Store,
  Users,
  Leaf,
  Heart,
  Globe,
  ChevronDown,
  Plus,
} from "lucide-react";
import heroImage from "/hero-farm-bg.jpg";

const LandingPage = ({ setLanding }: any) => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 text-center text-white px-6 max-w-6xl mx-auto">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            🌱 Revolutionizing Agriculture
            <span className="block bg-gradient-to-r from-[#2563eb] to-[#22c55e] bg-clip-text text-transparent">
              with Blockchain Transparency
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            From farms to your plate — track every step of your food's journey.
            Empowering farmers, ensuring fair pricing, and building consumer
            trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#2563eb] to-[#22c55e] text-white px-12 py-6 text-xl font-semibold rounded-full hover:opacity-90 transition"
              onClick={() => scrollToSection("features")}
            >
              ➡️ Get Started Today <ChevronDown className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Revolutionary Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge blockchain technology meets traditional agriculture
              for complete transparency.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 text-center hover:shadow-xl transition border-0 bg-gradient-to-b from-white to-blue-50">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#2563eb] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Blockchain Security</h3>
                <p className="text-gray-600">
                  Every crop record is immutable and verified on blockchain. No
                  fraud, no tampering.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 text-center hover:shadow-xl transition border-0 bg-gradient-to-b from-white to-green-50">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Transparent Pricing</h3>
                <p className="text-gray-600">
                  Farmers get fair payments, consumers see real pricing
                  breakdowns.
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-8 text-center hover:shadow-xl transition border-0 bg-gradient-to-b from-white to-green-50">
                <div className="w-20 h-20 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">QR Code Access</h3>
                <p className="text-gray-600">
                  Scan once. Know the origin, quality, and journey of your
                  produce instantly.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple 4-step process that transforms how we track food from
              farm to table.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Tractor,
                title: "Farmer Registers Crop",
                description:
                  "Farmers record produce details on blockchain with farming methods and origin data.",
              },
              {
                icon: Truck,
                title: "Distributor Updates Journey",
                description:
                  "Products are transferred securely, logged transparently with transport conditions.",
              },
              {
                icon: Store,
                title: "Retailer Verifies & Sells",
                description:
                  "Retailers confirm quality, price, and availability before selling to consumers.",
              },
              {
                icon: Users,
                title: "Consumer Scans QR Code",
                description:
                  "Buyers trace the entire journey instantly with complete transparency.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center relative"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-[#2563eb] via-[#22c55e] to-[#16a34a] shadow-lg rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Benefits for Everyone</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Creating value across the entire agricultural ecosystem.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Leaf,
                title: "For Farmers",
                description:
                  "Fair pricing, no exploitation, direct consumer trust.",
              },
              {
                icon: Heart,
                title: "For Consumers",
                description:
                  "Verified quality, origin assurance, ethical choices.",
              },
              {
                icon: Globe,
                title: "For Supply Chain",
                description:
                  "Reduced fraud, efficient tracking, automated trust.",
              },
              {
                icon: Shield,
                title: "For Sustainability",
                description:
                  "Encourages ethical sourcing and waste reduction.",
              },
            ].map((benefit, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 text-center hover:shadow-lg transition h-full bg-white text-black">
                  <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our platform.
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                question: "Do consumers need crypto wallets?",
                answer:
                  "No. Consumers simply scan a QR code — blockchain works behind the scenes.",
              },
              {
                question: "Is this expensive for farmers?",
                answer:
                  "No. Runs on low-cost cloud/mobile devices, accessible for all farmers.",
              },
              {
                question: "Why blockchain for agriculture?",
                answer:
                  "Because trust matters. Blockchain ensures every step is transparent and tamper-proof.",
              },
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 hover:shadow-lg transition bg-white text-black">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-gradient-to-tr from-[#2563eb] to-[#22c55e] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#2563eb] via-[#22c55e] to-[#16a34a] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-6xl md:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            🍅 Trust Your Food.
            <span className="block">Empower Farmers.</span>
            <span className="block">Transform Agriculture.</span>
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl mb-12 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Join the revolution in agricultural transparency and help build a
            more trustworthy food system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Button
              size="lg"
              className="bg-white text-green-700 px-16 py-8 text-2xl font-bold rounded-full hover:bg-gray-100 transition"
              onClick={() => setLanding(false)}
            >
              ➡️ Get Started Now →
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
