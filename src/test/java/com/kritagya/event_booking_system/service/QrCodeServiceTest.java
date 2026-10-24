package com.kritagya.event_booking_system.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class QrCodeServiceTest {

    private QrCodeService qrCodeService;

    @BeforeEach
    void setUp() {
        qrCodeService = new QrCodeService();
    }

    @Test
    @DisplayName("generateQrCodeImage generates valid non-empty PNG byte array")
    void generateQrCodeImage_ValidContent() {
        String testPayload = "TICKET-UUID-9876543210-CHECKIN";

        byte[] pngBytes = qrCodeService.generateQrCodeImage(testPayload);

        assertThat(pngBytes).isNotNull();
        assertThat(pngBytes.length).isGreaterThan(100);

        // PNG specification magic header signature: 0x89 'P' 'N' 'G'
        assertThat((int) (pngBytes[0] & 0xFF)).isEqualTo(0x89);
        assertThat((char) pngBytes[1]).isEqualTo('P');
        assertThat((char) pngBytes[2]).isEqualTo('N');
        assertThat((char) pngBytes[3]).isEqualTo('G');
    }
}
