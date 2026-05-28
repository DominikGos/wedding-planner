package com.planner.wedding.dto;

import java.math.BigDecimal;

public class PaymentSummaryResponse {

    private BigDecimal totalAmount;
    private BigDecimal pendingAmount;
    private BigDecimal successAmount;
    private BigDecimal failedAmount;
    private BigDecimal cancelledAmount;
    private BigDecimal offlineAmount;
    private BigDecimal offlineApprovedAmount;

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(BigDecimal pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public BigDecimal getSuccessAmount() {
        return successAmount;
    }

    public void setSuccessAmount(BigDecimal successAmount) {
        this.successAmount = successAmount;
    }

    public BigDecimal getFailedAmount() {
        return failedAmount;
    }

    public void setFailedAmount(BigDecimal failedAmount) {
        this.failedAmount = failedAmount;
    }

    public BigDecimal getCancelledAmount() {
        return cancelledAmount;
    }

    public void setCancelledAmount(BigDecimal cancelledAmount) {
        this.cancelledAmount = cancelledAmount;
    }

    public BigDecimal getOfflineAmount() {
        return offlineAmount;
    }

    public void setOfflineAmount(BigDecimal offlineAmount) {
        this.offlineAmount = offlineAmount;
    }

    public BigDecimal getOfflineApprovedAmount() {
        return offlineApprovedAmount;
    }

    public void setOfflineApprovedAmount(BigDecimal offlineApprovedAmount) {
        this.offlineApprovedAmount = offlineApprovedAmount;
    }
}
