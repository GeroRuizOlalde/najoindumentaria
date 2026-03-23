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

interface ReservationConfirmationProps {
  customerName: string;
  orderCode: string;
  productName: string;
  brandName: string;
  sizeLabel: string;
  price: string;
  bankName?: string;
  bankHolder?: string;
  bankCbu?: string;
  bankAlias?: string;
  bankAccountType?: string;
  bankInstructions?: string;
  expiresAt: string;
  whatsappNumber?: string;
}

export default function ReservationConfirmation({
  customerName = "Cliente",
  orderCode = "NAJO-000000",
  productName = "Producto",
  brandName = "Marca",
  sizeLabel = "42",
  price = "$0",
  bankName,
  bankHolder,
  bankCbu,
  bankAlias,
  bankAccountType,
  bankInstructions,
  expiresAt,
  whatsappNumber,
}: ReservationConfirmationProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={logo}>NAJO</Heading>
          <Hr style={hr} />

          <Heading as="h2" style={heading}>
            ¡Reserva confirmada!
          </Heading>

          <Text style={text}>Hola {customerName},</Text>
          <Text style={text}>
            Tu reserva fue registrada correctamente. Tu código de pedido es:
          </Text>

          <Section style={codeBox}>
            <Text style={codeText}>{orderCode}</Text>
          </Section>

          <Text style={subheading}>Detalle del pedido</Text>
          <Text style={text}>
            {brandName} {productName}
            <br />
            Talle: {sizeLabel}
            <br />
            Monto: <strong>{price}</strong>
          </Text>

          <Hr style={hr} />

          <Text style={subheading}>Datos para transferencia</Text>
          {bankName && <Text style={bankRow}>Banco: {bankName}</Text>}
          {bankHolder && <Text style={bankRow}>Titular: {bankHolder}</Text>}
          {bankCbu && <Text style={bankRow}>CBU: {bankCbu}</Text>}
          {bankAlias && <Text style={bankRow}>Alias: {bankAlias}</Text>}
          {bankAccountType && (
            <Text style={bankRow}>Tipo: {bankAccountType}</Text>
          )}
          {bankInstructions && (
            <Text style={{ ...text, fontSize: "12px", color: "#6B6B6B" }}>
              {bankInstructions}
            </Text>
          )}

          <Hr style={hr} />

          <Text style={{ ...text, color: "#D97706", fontWeight: 600 }}>
            Tenés hasta el {expiresAt} para realizar la transferencia. Pasado
            ese plazo, la reserva se cancela automáticamente.
          </Text>

          <Text style={text}>
            Una vez realizada la transferencia, envianos el comprobante por
            WhatsApp indicando tu código de pedido.
          </Text>

          {whatsappNumber && (
            <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
              <Link
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Mi código de pedido es: ${orderCode}`)}`}
                style={button}
              >
                Enviar comprobante por WhatsApp
              </Link>
            </Section>
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

const subheading = {
  fontSize: "14px",
  fontWeight: 600 as const,
  marginBottom: "8px",
  marginTop: "24px",
};

const text = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#0A0A0A",
};

const bankRow = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#0A0A0A",
  margin: "4px 0",
};

const codeBox = {
  backgroundColor: "#F7F7F5",
  padding: "16px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const codeText = {
  fontSize: "24px",
  fontWeight: 700 as const,
  fontFamily: "monospace",
  letterSpacing: "0.1em",
};

const hr = {
  borderColor: "#E5E5E5",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#25D366",
  color: "#FFFFFF",
  padding: "12px 24px",
  fontSize: "12px",
  fontWeight: 600 as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  textDecoration: "none",
};

const footer = {
  fontSize: "12px",
  color: "#6B6B6B",
  textAlign: "center" as const,
};
