import { forwardRef } from "react";
import { Image } from "@mantine/core";
import { FlowKeyIcon } from "../../../assets/icons";
import { PosterConfig } from "./QRCodePosterSystem";
import whiteBackground from "../../../assets/images/whiteBg.svg";

interface QRCodePosterProps {
  bookingLink: string;
  businessName: string;
  businessType?: string;
  config: PosterConfig;
  qrCodeUrl: string;
  isPreview?: boolean;
}

const QRCodePoster = forwardRef<HTMLDivElement, QRCodePosterProps>(
  (
    {
      bookingLink,
      businessName,
      businessType,
      config,
      qrCodeUrl,
      isPreview = false,
    },
    ref
  ) => {
    const isDark = config.theme === "dark";

    const flowkeyColors = {
      primary: "#162F3B",
      secondary: "#1D9B5E",
      accent: "#D2F801",
      dark: "#0F2028",
      light: "#ffffff",
      muted: "#6B7280",
    };

    const getDimensions = () => {
      const formats = {
        A4: { width: 210, height: 297, layout: "portrait" },
        A3: { width: 297, height: 420, layout: "portrait" },
      };

      const format = formats[config.format as keyof typeof formats];
      const sizeMultiplier = {
        small: 0.85,
        medium: 1.0,
        large: 1.15,
      }[config.size];

      return {
        width: format.width * sizeMultiplier,
        height: format.height * sizeMultiplier,
        layout: format.layout,
      };
    };

    const dimensions = getDimensions();
    const bgColor = isDark ? flowkeyColors.dark : flowkeyColors.light;
    const textColor = isDark ? flowkeyColors.light : flowkeyColors.primary;
    const accentColor = config.primaryColor;
    const mutedColor = isDark ? "#94A3B8" : flowkeyColors.muted;

    const getContainerStyle = () => {
      if (isPreview) {
        return {
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          // Maintain aspect ratio while fitting completely
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          // Ensure it scales down to fit the container
          transform: "scale(1)",
          transformOrigin: "center center",
        };
      } else {
        // Print version uses actual dimensions
        return {
          width: `${dimensions.width}mm`,
          height: `${dimensions.height}mm`,
        };
      }
    };

    const baseStyle = {
      ...getContainerStyle(),
      backgroundColor: bgColor,
      color: textColor,
      borderRadius: `${config.cornerRadius}px`,
      position: "relative" as const,
      overflow: "hidden" as const,
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      border: isDark ? `2px solid ${accentColor}20` : `1px solid #E5E7EB`,
      boxShadow: isDark
        ? `0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px ${accentColor}10`
        : "0 25px 50px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)",
      // Ensure proper print rendering
      printColorAdjust: "exact" as const,
      WebkitPrintColorAdjust: "exact" as const,
      // Critical for proper scaling in preview
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
    };

    const renderBackgroundPattern = () => (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `
              radial-gradient(circle at 25% 25%, ${accentColor}06 0%, transparent 60%),
              radial-gradient(circle at 75% 75%, ${flowkeyColors.secondary}04 0%, transparent 100%),
              linear-gradient(135deg, ${accentColor}02 0%, transparent 70%, ${flowkeyColors.secondary}02 100%)
            `
            : `url(${whiteBackground})`,
          backgroundSize: isDark
            ? "300px 300px, 250px 250px, 100% 100%"
            : "cover",
          backgroundPosition: isDark ? "initial" : "center",
          backgroundRepeat: isDark ? "initial" : "no-repeat",
          opacity: isDark ? 0.8 : 0.95,
        }}
      />
    );

    const getHeaderSizing = () => {
      return {
        businessName: {
          fontSize: isPreview
            ? "clamp(18px, 5vw, 28px)"
            : config.format === "A3"
            ? "clamp(56px, 9vw, 76px)"
            : "clamp(48px, 8.5vw, 72px)",
          marginBottom: isPreview ? "8px" : "20px",
        },
        badge: {
          fontSize: isPreview
            ? "clamp(4px, 1.2vw, 6px)"
            : config.format === "A3"
            ? "clamp(10px, 1.9vw, 14px)"
            : "clamp(9px, 1.8vw, 12px)",
          padding: isPreview
            ? "2px 6px"
            : config.format === "A3"
            ? "5px 14px"
            : "4px 12px",
        },
      };
    };

    const renderHeader = () => {
      const sizing = getHeaderSizing();

      return (
        <div className="relative z-10 text-center flex-shrink-0">
          <h1
            className="font-black tracking-tight leading-tight mb-3"
            style={{
              fontSize: sizing.businessName.fontSize,
              color: textColor,
              textShadow: isDark
                ? "0 2px 8px rgba(0,0,0,0.3)"
                : "0 1px 2px rgba(0,0,0,0.1)",
              marginBottom: sizing.businessName.marginBottom,
              letterSpacing: "-0.01em",
            }}
          >
            {businessName}
          </h1>

          {businessType && (
            <div
              className="inline-flex items-center rounded-full font-semibold mx-auto mb-4"
              style={{
                backgroundColor: isDark
                  ? `${accentColor}12`
                  : `${accentColor}08`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
                fontSize: sizing.badge.fontSize,
                fontWeight: "600",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                padding: sizing.badge.padding,
              }}
            >
              {businessType}
            </div>
          )}
        </div>
      );
    };

    const getCTASizing = () => {
      return {
        headline: {
          fontSize: isPreview
            ? "clamp(12px, 3.2vw, 18px)"
            : config.format === "A3"
            ? "clamp(32px, 5vw, 44px)"
            : "clamp(28px, 4.5vw, 38px)",
          marginBottom: isPreview ? "6px" : "16px",
        },
        description: {
          fontSize: isPreview
            ? "clamp(6px, 1.4vw, 9px)"
            : config.format === "A3"
            ? "clamp(14px, 2.2vw, 18px)"
            : "clamp(12px, 2vw, 16px)",
        },
      };
    };

    const renderMainCTA = () => {
      const sizing = getCTASizing();

      return (
        <div className="relative z-10 text-center flex-shrink-0">
          <h2
            className="font-bold tracking-tight mb-3"
            style={{
              fontSize: sizing.headline.fontSize,
              color: accentColor,
              textShadow: isDark ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
              marginBottom: sizing.headline.marginBottom,
            }}
          >
            Scan to Book Instantly
          </h2>

          <p
            className="font-medium leading-relaxed"
            style={{
              fontSize: sizing.description.fontSize,
              color: mutedColor,
              maxWidth: "85%",
              margin: "0 auto",
              lineHeight: "1.5",
            }}
          >
            Quick, easy, and convenient booking at your fingertips
          </p>
        </div>
      );
    };

    const getQRSizing = () => {
      return {
        container: {
          padding: isPreview
            ? "12px"
            : config.format === "A3"
            ? "28px"
            : "24px",
          border: isPreview ? "3px" : config.format === "A3" ? "7px" : "6px",
          borderRadius: "24px",
        },
        qrCode: {
          width: isPreview
            ? "100px"
            : config.format === "A3"
            ? "180px"
            : "160px",
          height: isPreview
            ? "100px"
            : config.format === "A3"
            ? "180px"
            : "160px",
        },
      };
    };

    const renderQRCode = () => {
      const sizing = getQRSizing();

      return (
        <div className="relative z-10 text-center flex-shrink-0 flex-grow flex flex-col justify-center">
          <div
            className="inline-block shadow-2xl mx-auto relative"
            style={{
              backgroundColor: flowkeyColors.light,
              border: `${sizing.container.border} solid ${accentColor}`,
              padding: sizing.container.padding,
              borderRadius: sizing.container.borderRadius,
            }}
          >
            <div
              className="bg-white rounded-xl flex items-center justify-center"
              style={{
                width: sizing.qrCode.width,
                height: sizing.qrCode.height,
              }}
            >
              <Image
                src={qrCodeUrl}
                alt="Booking QR Code"
                style={{
                  width: "95%",
                  height: "95%",
                  borderRadius: "8px",
                  display: "block",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.parentElement;
                  if (fallback) {
                    fallback.innerHTML = `
                      <div style="
                        width: 95%;
                        height: 95%;
                        background: #f3f4f6;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${isPreview ? "8px" : "12px"};
                        color: #6b7280;
                        border-radius: 8px;
                      ">
                        QR Code Loading...
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-4 text-center">
            <div
              className="inline-block rounded-lg border font-mono"
              style={{
                fontSize: isPreview
                  ? "clamp(6px, 1.2vw, 8px)"
                  : "clamp(9px, 1.8vw, 12px)",
                color: mutedColor,
                backgroundColor: isDark
                  ? `${textColor}08`
                  : `${flowkeyColors.primary}06`,
                padding: isPreview ? "3px 6px" : "6px 12px",
                borderColor: isDark
                  ? `${textColor}15`
                  : `${flowkeyColors.primary}15`,
                maxWidth: "85%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {bookingLink.replace(/^https?:\/\//, "")}
            </div>
          </div>

          <div className="mt-3">
            <div
              className="inline-flex items-center gap-2 rounded-full mx-auto"
              style={{
                backgroundColor: isDark
                  ? `${accentColor}12`
                  : `${accentColor}08`,
                border: `1px solid ${accentColor}30`,
                color: isDark ? flowkeyColors.light : flowkeyColors.primary,
                padding: isPreview ? "4px 8px" : "8px 14px",
              }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: isPreview ? "16px" : "24px",
                  height: isPreview ? "16px" : "24px",
                  backgroundColor: accentColor,
                  color: "white",
                  fontSize: isPreview ? "9px" : "12px",
                  fontWeight: "700",
                }}
              >
                📱
              </div>
              <span
                style={{
                  fontSize: isPreview
                    ? "clamp(8px, 1.8vw, 11px)"
                    : "clamp(12px, 2.2vw, 16px)",
                  fontWeight: "600",
                }}
              >
                Open Camera → Point → Book
              </span>
            </div>
          </div>
        </div>
      );
    };

    const getFeaturesSizing = () => {
      return {
        container: {
          gap: 4,
          maxWidth: "max-w-sm",
        },
        icon: {
          width: isPreview
            ? "clamp(24px, 5vw, 30px)"
            : config.format === "A3"
            ? "clamp(44px, 6.5vw, 58px)"
            : "clamp(40px, 6.5vw, 54px)",
          fontSize: isPreview
            ? "clamp(10px, 2.5vw, 13px)"
            : config.format === "A3"
            ? "clamp(16px, 3.2vw, 22px)"
            : "clamp(12px, 2.8vw, 20px)",
        },
        text: {
          label: isPreview
            ? "clamp(6px, 1.6vw, 8px)"
            : config.format === "A3"
            ? "clamp(12px, 2.2vw, 16px)"
            : "clamp(10px, 2vw, 14px)",
          subtitle: isPreview
            ? "clamp(5px, 1.2vw, 7px)"
            : config.format === "A3"
            ? "clamp(10px, 1.8vw, 13px)"
            : "clamp(8px, 1.6vw, 11px)",
        },
      };
    };

    const renderFeatures = () => {
      const sizing = getFeaturesSizing();

      return (
        <div className="relative z-10 flex-shrink-0">
          <div
            className={`flex justify-center items-start ${sizing.container.maxWidth} mx-auto`}
            style={{
              width: "100%",
              gap: `${sizing.container.gap * 4}px`,
            }}
          >
            {[
              {
                icon: "⚡",
                label: "Instant",
                subtitle: "Booking",
                color: "#F59E0B",
              },
              {
                icon: "🔒",
                label: "Secure",
                subtitle: "System",
                color: "#10B981",
              },
              {
                icon: "📞",
                label: "24/7",
                subtitle: "Available",
                color: "#3B82F6",
              },
            ].map((feature, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className="rounded-xl mx-auto mb-1 shadow-sm"
                  style={{
                    width: sizing.icon.width,
                    height: sizing.icon.width,
                    backgroundColor: isDark
                      ? `${feature.color}15`
                      : `${feature.color}10`,
                    border: `1.5px solid ${feature.color}40`,
                    fontSize: sizing.icon.fontSize,
                    boxShadow: `0 2px 6px ${feature.color}15`,
                    textAlign: "center",
                    lineHeight: sizing.icon.width,
                  }}
                >
                  {feature.icon}
                </div>
                <div
                  style={{
                    fontSize: sizing.text.label,
                    fontWeight: "700",
                    color: textColor,
                    marginBottom: "1px",
                    textAlign: "center",
                  }}
                >
                  {feature.label}
                </div>
                <div
                  style={{
                    fontSize: sizing.text.subtitle,
                    color: mutedColor,
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  {feature.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderFooter = () => (
      <div className="relative z-10 text-center mt-2 flex-shrink-0">
        <div
          className="inline-flex items-center gap-1.5 rounded-full"
          style={{
            backgroundColor: isDark
              ? `${flowkeyColors.secondary}12`
              : `${flowkeyColors.secondary}06`,
            border: `1px solid ${flowkeyColors.secondary}25`,
            padding: isPreview ? "3px 6px" : "6px 12px",
          }}
        >
          <FlowKeyIcon
            style={{
              color: flowkeyColors.secondary,
              width: isPreview ? "12px" : "16px",
              height: isPreview ? "12px" : "16px",
            }}
          />
          <span
            style={{
              fontSize: isPreview
                ? "clamp(6px, 1.4vw, 8px)"
                : "clamp(10px, 1.8vw, 14px)",
              fontWeight: "600",
              color: flowkeyColors.secondary,
            }}
          >
            Powered by FlowKey
          </span>
        </div>
      </div>
    );

    return (
      <div
        ref={ref}
        style={baseStyle}
        className={`${isPreview ? "p-6" : "p-16"}`}
      >
        {renderBackgroundPattern()}

        <div
          className="h-full mx-auto"
          style={{
            maxWidth: isPreview ? "85%" : "80%",
            paddingTop: isPreview ? "8px" : "16px",
            paddingBottom: isPreview ? "4px" : "12px",
          }}
        >
          <div
            className="flex flex-col h-full justify-between"
            style={{
              gap: isPreview ? "8px" : config.format === "A3" ? "30px" : "24px",
            }}
          >
            {renderHeader()}
            {renderMainCTA()}
            {renderQRCode()}
            {renderFeatures()}
            {renderFooter()}
          </div>
        </div>
      </div>
    );
  }
);

QRCodePoster.displayName = "QRCodePoster";

export default QRCodePoster;
