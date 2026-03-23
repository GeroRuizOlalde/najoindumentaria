import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
} from "@react-email/components";

interface OrderStatusUpdateProps {
  customerName: string;
  orderCode: string;
  statusLabel: string;
  note?: string;
  trackingNumber?: string;
}

export default function OrderStatusUpdate({
  customerName = "Cliente",
  orderCode = "NAJO-000000",
  statusLabel = "Confirmado",
  note,
  trackingNumber,
}: OrderStatusUpdateProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>NAJO</Heading>
          <Hr style={hr} />

          <Heading as="h2" style={heading}>
            Actualización de tu pedido
          </Heading>

          <Text style={text}>Hola {customerName},</Text>
          <Text style={text}>
            Tu pedido <strong>{orderCode}</strong> cambió de estado:
          </Text>

          <Section style={statusBox}>
            <Text style={statusText}>{statusLabel}</Text>
          </Section>

          {note && <Text style={text}>{note}</Text>}

          {trackingNumber && (
            <Text style={text}>
              Número de seguimiento: <strong>{trackingNumber}</strong>
            </Text>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Najo Indumentaria — Streetwear Premium
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#F7F7F5",
  fontFamily: "Inter, system-ui, sans-serif",
};

const container = {
  backgroundColor: "#FFFFFF",
  margin: "0 auto",
  padding: "40px 32px",
  maxWidth: "560px",
};

const logo = {
  fontSize: "24px",
  fontWeight: 700 as const,
  textAlign: "center" as const,
  letterSpacing: "-0.02em",
};

const heading = {
  fontSize: "20px",
  fontWeight: 600 as const,
  marginBottom: "16px",
};

const text = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#0A0A0A",
};

const statusBox = {
  backgroundColor: "#F7F7F5",
  padding: "16px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const statusText = {
  fontSize: "18px",
  fontWeight: 600 as const,
};

const hr = {
  borderColor: "#E5E5E5",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#6B6B6B",
  textAlign: "center" as const,
};
