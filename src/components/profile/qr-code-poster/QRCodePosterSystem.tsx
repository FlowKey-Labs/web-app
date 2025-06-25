import React, { useState, useRef } from "react";
import {
  Modal,
  Tabs,
  Button,
  Text,
  Group,
  Box,
  Card,
  ColorPicker,
  Slider,
  Select,
  Radio,
  RadioGroup,
  Checkbox,
  Paper,
  Stack,
  Badge,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import QRCodePoster from "./QRCodePoster";
import { FlowKeyIcon } from "../../../assets/icons";

export interface PosterConfig {
  theme: "light" | "dark";
  size: "small" | "medium" | "large";
  format: "A4" | "A3";
  showBranding: boolean;
  qrSize: number;
  cornerRadius: number;
  primaryColor: string;
}

interface QRCodePosterSystemProps {
  bookingLink: string;
  businessName: string;
  businessType?: string;
}

const QRCodePosterSystem: React.FC<QRCodePosterSystemProps> = ({
  bookingLink,
  businessName,
  businessType = "Business",
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [config, setConfig] = useState<PosterConfig>({
    theme: "light",
    size: "medium",
    format: "A4",
    showBranding: true,
    qrSize: 300,
    cornerRadius: 12,
    primaryColor: "#1D9B5E",
  });

  const flowkeyColors = [
    "#1D9B5E",
    "#D2F801",
    "#162F3B",
    "#0F2028",
    "#2F72EE",
    "#FF6B35",
  ];

  const updateConfig = (updates: Partial<PosterConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${
    config.qrSize
  }x${config.qrSize}&data=${encodeURIComponent(bookingLink)}&format=svg`;

  const generatePoster = async (format: "png" | "svg" = "png") => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      if (format === "png") {
        const dataUrl = await toPng(posterRef.current, {
          quality: 1.0,
          pixelRatio: 3,
          backgroundColor: config.theme === "dark" ? "#0F2028" : "#ffffff",
          width: posterRef.current.offsetWidth * 3,
          height: posterRef.current.offsetHeight * 3,
          style: {
            transform: "scale(3)",
            transformOrigin: "top left",
          },
          skipFonts: true,
          includeQueryParams: false,
          cacheBust: false,
          filter: (node) => {
            if (
              node.tagName === "LINK" ||
              node.tagName === "STYLE" ||
              (node.tagName === "SCRIPT" &&
                (node as HTMLElement).getAttribute("src")?.includes("http"))
            ) {
              return false;
            }
            return true;
          },
        });

        const response = await fetch(dataUrl);
        const blob = await response.blob();
        saveAs(
          blob,
          `${businessName
            .replace(/\s+/g, "-")
            .toLowerCase()}-qr-poster-${config.format.toLowerCase()}-${
            config.theme
          }.png`
        );

        notifications.show({
          title: "Download Complete",
          message: `Your ${config.format} poster has been downloaded in high resolution`,
          color: "green",
        });
      }
    } catch (error) {
      console.error("Error generating poster:", error);
      notifications.show({
        title: "Generation Failed",
        message: "Please try again or contact support if the issue persists",
        color: "red",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormatInfo = (format: string) => {
    const formats = {
      A4: { dimensions: "210×297mm", description: "International standard" },
      A3: { dimensions: "297×420mm", description: "Large format" },
    };
    return formats[format as keyof typeof formats];
  };

  const QuickActions = () => (
    <Stack gap="md">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Paper p="md" radius="md" style={{ border: "2px solid #1D9B5E" }}>
          <Group justify="space-between" align="center">
            <Box>
              <Text fw={600} size="sm" mb="xs" style={{ color: "#162F3B" }}>
                Ready to Print
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                Perfect defaults with Flowkey branding
              </Text>
              <Group gap="xs">
                <Badge variant="light" color="green" size="xs">
                  Recommended
                </Badge>
                <Badge variant="light" color="blue" size="xs">
                  {getFormatInfo(config.format).dimensions}
                </Badge>
              </Group>
            </Box>
            <Button
              variant="filled"
              size="sm"
              style={{
                backgroundColor: "#1D9B5E",
                color: "white",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              loading={isGenerating}
              onClick={() => generatePoster("png")}
            >
              Download {config.format}
            </Button>
          </Group>
        </Paper>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Paper p="sm" radius="md" style={{ border: "1px solid #e2e8f0" }}>
          <Group justify="space-between" align="center">
            <Box>
              <Text fw={500} size="xs" mb="xs">
                Need customization?
              </Text>
              <Text size="xs" c="dimmed">
                Change colors and themes
              </Text>
            </Box>
            <Button
              variant="outline"
              size="xs"
              style={{
                borderColor: "#1D9B5E",
                color: "#1D9B5E",
                fontSize: "11px",
              }}
              onClick={() => setActiveTab("themes")}
            >
              Customize
            </Button>
          </Group>
        </Paper>
      </motion.div>
    </Stack>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          leftSection={<FlowKeyIcon className="w-3 h-3" />}
          size="sm"
          fullWidth
          style={{
            backgroundColor: "#1D9B5E",
            color: "white",
            borderRadius: "6px",
            fontSize: "13px",
            height: "36px",
            padding: "0 16px",
          }}
          onClick={open}
        >
          Create Professional Poster
        </Button>
      </motion.div>

      <Modal
        opened={opened}
        onClose={close}
        size="98vw"
        title={
          <Group gap="sm">
            <FlowKeyIcon className="w-6 h-6" style={{ color: "#1D9B5E" }} />
            <Text fw={600} size="lg" style={{ color: "#162F3B" }}>
              QR Code Poster Designer
            </Text>
          </Group>
        }
        styles={{
          content: {
            height: "95vh",
            display: "flex",
            flexDirection: "column",
          },
          body: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            overflow: "hidden",
          },
          header: {
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "white",
            borderBottom: "none",
            margin: 0,
            padding: "16px 24px 0 24px",
            flexShrink: 0,
          },
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className="flex-shrink-0 bg-white"
            style={{ position: "relative", zIndex: 100 }}
          >
            <div className="px-6">
              <style>
                {`
                  .poster-tabs .mantine-Tabs-tab {
                    font-weight: 500;
                    font-size: 14px;
                    color: #6B7280;
                    border: none;
                    border-bottom: 2px solid transparent;
                    border-radius: 0;
                    padding: 16px 24px;
                    background-color: transparent;
                    transition: all 0.2s ease;
                  }
                  
                  .poster-tabs .mantine-Tabs-tab:hover {
                    background-color: #f8fafc;
                    color: #162F3B;
                  }
                  
                  .poster-tabs .mantine-Tabs-tab[data-active="true"] {
                    color: #1D9B5E !important;
                    border-bottom-color: #1D9B5E !important;
                    background-color: transparent !important;
                    font-weight: 600 !important;
                  }
                  
                  .poster-tabs .mantine-Tabs-list {
                    border-bottom: 1px solid #e9ecef;
                    background-color: transparent;
                    gap: 0;
                  }
                `}
              </style>
              <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value || "preview")}
                className="poster-tabs"
              >
                <Tabs.List grow>
                  <Tabs.Tab value="preview">Live Preview</Tabs.Tab>
                  <Tabs.Tab value="themes">Themes & Colors</Tabs.Tab>
                  <Tabs.Tab value="customization">Customization</Tabs.Tab>
                  <Tabs.Tab value="download">Download & Print</Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "preview" ? (
              <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/2 lg:w-2/5 h-full overflow-y-auto p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <Box mb="lg">
                    <Text
                      fw={600}
                      size="lg"
                      mb="sm"
                      style={{ color: "#162F3B" }}
                    >
                      Live Preview - {config.format} Format
                    </Text>
                    <Text size="sm" c="dimmed">
                      This is exactly what your poster will look like when
                      printed
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Badge variant="light" color="green" size="sm">
                        PRINT READY
                      </Badge>
                      <Badge variant="light" color="blue" size="sm">
                        {getFormatInfo(config.format).description}
                      </Badge>
                    </Group>
                  </Box>

                  <QuickActions />

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <Card
                      p="sm"
                      radius="md"
                      style={{ backgroundColor: "#f8fafc" }}
                      className="mt-4"
                    >
                      <Group justify="space-between" align="center">
                        <Text size="xs" fw={500}>
                          Theme
                        </Text>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant={
                              config.theme === "light" ? "filled" : "outline"
                            }
                            style={
                              config.theme === "light"
                                ? {
                                    backgroundColor: "#1D9B5E",
                                    fontSize: "11px",
                                  }
                                : {
                                    borderColor: "#1D9B5E",
                                    color: "#1D9B5E",
                                    fontSize: "11px",
                                  }
                            }
                            onClick={() => updateConfig({ theme: "light" })}
                          >
                            Light
                          </Button>
                          <Button
                            size="xs"
                            variant={
                              config.theme === "dark" ? "filled" : "outline"
                            }
                            style={
                              config.theme === "dark"
                                ? {
                                    backgroundColor: "#162F3B",
                                    fontSize: "11px",
                                  }
                                : {
                                    borderColor: "#162F3B",
                                    color: "#162F3B",
                                    fontSize: "11px",
                                  }
                            }
                            onClick={() => updateConfig({ theme: "dark" })}
                          >
                            Dark
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <Card
                      p="sm"
                      radius="md"
                      style={{ backgroundColor: "#f0f9ff" }}
                      className="mt-4"
                    >
                      <Text
                        size="xs"
                        fw={500}
                        mb="xs"
                        style={{ color: "#162F3B" }}
                      >
                        Format
                      </Text>
                      <Group gap="xs">
                        {["A4", "A3"].map((format) => (
                          <Button
                            key={format}
                            size="xs"
                            variant={
                              config.format === format ? "filled" : "outline"
                            }
                            style={
                              config.format === format
                                ? {
                                    backgroundColor: "#1D9B5E",
                                    fontSize: "11px",
                                  }
                                : {
                                    borderColor: "#1D9B5E",
                                    color: "#1D9B5E",
                                    fontSize: "11px",
                                  }
                            }
                            onClick={() =>
                              updateConfig({ format: format as "A4" | "A3" })
                            }
                          >
                            {format}
                          </Button>
                        ))}
                      </Group>
                    </Card>
                  </motion.div>

                  <Card
                    p="md"
                    radius="md"
                    style={{ backgroundColor: "#f0f9ff" }}
                    className="mt-4"
                  >
                    <Group justify="space-between" align="center" mb="sm">
                      <FlowKeyIcon
                        className="w-5 h-5"
                        style={{ color: "#1D9B5E" }}
                      />
                      <Text size="sm" fw={500} style={{ color: "#162F3B" }}>
                        Download Options
                      </Text>
                    </Group>
                    <Button
                      fullWidth
                      size="sm"
                      variant="light"
                      color="blue"
                      loading={isGenerating}
                      onClick={() => generatePoster("png")}
                    >
                      Download Print Ready (High-Res PNG)
                    </Button>
                  </Card>
                </div>

                <div className="w-full md:w-1/2 lg:w-3/5 h-full overflow-y-auto bg-gray-50 p-4 md:p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Live Preview - {config.format} Format
                    </h3>
                    <p className="text-sm text-gray-600">
                      This is exactly what your poster will look like when
                      printed
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {config.format === "A4" && "210×297mm"}
                      {config.format === "A3" && "297×420mm"}
                      {config.size !== "medium" && ` • ${config.size} size`}
                    </div>
                  </div>

                  <div
                    className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
                    style={{
                      width: "100%",
                      maxWidth: "450px",
                      height: config.format === "A4" ? "600px" : "700px",
                      border: "2px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QRCodePoster
                        ref={posterRef}
                        bookingLink={bookingLink}
                        businessName={businessName}
                        businessType={businessType}
                        config={config}
                        qrCodeUrl={qrCodeUrl}
                        isPreview={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4 md:p-6">
                {activeTab === "themes" && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        Theme Selection
                      </Text>
                      <RadioGroup
                        value={config.theme}
                        onChange={(value) =>
                          updateConfig({ theme: value as "light" | "dark" })
                        }
                      >
                        <Group>
                          <Radio
                            value="light"
                            label="Light Theme"
                            description="Clean white background with dark text"
                            styles={{ label: { color: "#162F3B" } }}
                          />
                          <Radio
                            value="dark"
                            label="Dark Theme"
                            description="Professional dark background with light text"
                            styles={{ label: { color: "#162F3B" } }}
                          />
                        </Group>
                      </RadioGroup>
                    </div>

                    <Divider />

                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        Brand Color
                      </Text>
                      <Text size="xs" c="dimmed" mb="md">
                        Choose from Flowkey's official brand colors
                      </Text>
                      <ColorPicker
                        value={config.primaryColor}
                        onChange={(color) =>
                          updateConfig({ primaryColor: color })
                        }
                        swatches={flowkeyColors}
                        swatchesPerRow={3}
                        size="lg"
                      />
                      <Text size="xs" c="dimmed" mt="sm">
                        Selected: {config.primaryColor.toUpperCase()}
                        {config.primaryColor === "#1D9B5E" &&
                          " (Flowkey Primary)"}
                        {config.primaryColor === "#D2F801" && " (Flowkey Lime)"}
                      </Text>
                    </div>

                    <Divider />

                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        Corner Radius
                      </Text>
                      <Slider
                        value={config.cornerRadius}
                        onChange={(value) =>
                          updateConfig({ cornerRadius: value })
                        }
                        min={0}
                        max={24}
                        step={4}
                        marks={[
                          { value: 0, label: "Sharp" },
                          { value: 12, label: "Rounded" },
                          { value: 24, label: "Very Rounded" },
                        ]}
                        styles={{
                          track: { backgroundColor: "#e2e8f0" },
                          bar: { backgroundColor: "#1D9B5E" },
                          thumb: {
                            borderColor: "#1D9B5E",
                            backgroundColor: "white",
                          },
                        }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "customization" && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        Poster Size
                      </Text>
                      <RadioGroup
                        value={config.size}
                        onChange={(value) =>
                          updateConfig({
                            size: value as "small" | "medium" | "large",
                          })
                        }
                      >
                        <Group>
                          <Radio
                            value="small"
                            label="Compact"
                            description="Perfect for small spaces"
                          />
                          <Radio
                            value="medium"
                            label="Standard"
                            description="Recommended for most uses"
                          />
                          <Radio
                            value="large"
                            label="Large"
                            description="High-visibility displays"
                          />
                        </Group>
                      </RadioGroup>
                    </div>

                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        Paper Format
                      </Text>
                      <Select
                        value={config.format}
                        onChange={(value) =>
                          updateConfig({
                            format: value as "A4" | "A3",
                          })
                        }
                        data={[
                          {
                            value: "A4",
                            label: "A4 (210×297mm) - International Standard",
                          },
                          {
                            value: "A3",
                            label: "A3 (297×420mm) - Large Format",
                          },
                        ]}
                      />
                      <Text size="xs" c="dimmed" mt="sm">
                        Current: {getFormatInfo(config.format).dimensions} -{" "}
                        {getFormatInfo(config.format).description}
                      </Text>
                    </div>

                    <div>
                      <Text
                        size="sm"
                        fw={500}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        QR Code Size
                      </Text>
                      <Slider
                        value={config.qrSize}
                        onChange={(value) => updateConfig({ qrSize: value })}
                        min={200}
                        max={500}
                        step={25}
                        marks={[
                          { value: 200, label: "Small" },
                          { value: 300, label: "Medium" },
                          { value: 400, label: "Large" },
                          { value: 500, label: "XL" },
                        ]}
                        styles={{
                          track: { backgroundColor: "#e2e8f0" },
                          bar: { backgroundColor: "#1D9B5E" },
                          thumb: {
                            borderColor: "#1D9B5E",
                            backgroundColor: "white",
                          },
                        }}
                      />
                    </div>

                    <Checkbox
                      checked={config.showBranding}
                      onChange={(event) =>
                        updateConfig({
                          showBranding: event.currentTarget.checked,
                        })
                      }
                      label="Include 'Powered by Flowkey' branding"
                      description="Helps us grow and improve our service"
                      styles={{
                        input: {
                          backgroundColor: config.showBranding
                            ? "#1D9B5E"
                            : "white",
                          borderColor: "#1D9B5E",
                        },
                        label: { color: "#162F3B" },
                      }}
                    />
                  </div>
                )}

                {activeTab === "download" && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    <div>
                      <Text
                        size="lg"
                        fw={600}
                        mb="sm"
                        style={{ color: "#162F3B" }}
                      >
                        Download Your Poster
                      </Text>
                      <Text size="sm" c="dimmed" mb="lg">
                        High-quality, print-ready files for professional display
                      </Text>
                    </div>

                    <Paper
                      p="lg"
                      radius="md"
                      style={{
                        border: "2px solid #1D9B5E",
                        backgroundColor: "#f0f9ff",
                      }}
                    >
                      <Group justify="space-between" align="center" mb="md">
                        <Box>
                          <Text fw={600} size="md" style={{ color: "#162F3B" }}>
                            Print Ready ({config.format} Format)
                          </Text>
                          <Text size="sm" c="dimmed">
                            High-resolution PNG optimized for professional
                            printing
                          </Text>
                          <Text size="xs" c="dimmed" mt="xs">
                            Dimensions:{" "}
                            {getFormatInfo(config.format).dimensions}
                          </Text>
                        </Box>
                        <Badge variant="light" color="green">
                          High Quality
                        </Badge>
                      </Group>

                      <Button
                        size="md"
                        style={{
                          backgroundColor: "#1D9B5E",
                          color: "white",
                        }}
                        loading={isGenerating}
                        onClick={() => generatePoster("png")}
                        fullWidth
                      >
                        Download {config.format} Print Ready PNG
                      </Button>
                    </Paper>

                    <Card
                      p="md"
                      radius="md"
                      style={{ backgroundColor: "#fff7ed" }}
                    >
                      <Text
                        fw={500}
                        size="sm"
                        mb="sm"
                        style={{ color: "#ea580c" }}
                      >
                        📋 Print Guidelines
                      </Text>
                      <ul className="text-sm text-gray-600 space-y-1 pl-4">
                        <li>• Use high-quality paper (minimum 120gsm)</li>
                        <li>• Print at 300 DPI or higher for crisp QR codes</li>
                        <li>• Test scan QR codes before mass printing</li>
                        <li>
                          • Consider laminating for durability in high-traffic
                          areas
                        </li>
                        <li>• Ensure good lighting when displaying</li>
                      </ul>
                    </Card>

                    <Card
                      p="md"
                      radius="md"
                      style={{ backgroundColor: "#f0f9ff" }}
                    >
                      <Group gap="sm" mb="sm">
                        <FlowKeyIcon
                          className="w-5 h-5"
                          style={{ color: "#1D9B5E" }}
                        />
                        <Text size="sm" fw={500} style={{ color: "#1D9B5E" }}>
                          Flowkey Branding
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        The "Powered by Flowkey" branding helps potential
                        customers discover our platform and enables us to
                        continue providing this free service. Thank you for
                        supporting our growth!
                      </Text>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QRCodePosterSystem;
