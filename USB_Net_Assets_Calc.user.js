// ==UserScript==
// @name         US Bank Net Assets Calculator with Visualization
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows net assets and liability visualization on US Bank dashboard
// @author       frankamedic
// @match        https://onlinebanking.usbank.com/digital/servicing/shellapp/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addStyles() {
        const styles = `
            .values-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                width: 100%;
                position: relative;
                padding-bottom: 24px;
            }
            .value-group {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            .value-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 8px;
            }
            .value-amount {
                font-size: 16px;
                font-weight: 600;
            }
            .amount-assets {
                color: #75b798 !important;
            }
            .amount-liabilities {
                color: #dc3545 !important;
            }
            .amount-net {
                color: darkgreen !important;
                font-size: 18px !important;
                font-weight: 700 !important;
            }
            .net-group {
                position: relative;
            }
            .net-group::before {
                content: '';
                position: absolute;
                left: -16px;
                top: 0;
                bottom: 0;
                width: 1px;
                background-color: #e8e8e8;
            }
            .progress-container {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
            }
            .net-worth-progress-container {
                width: 100%;
                height: 4px;
                background-color: #e8e8e8;
                overflow: hidden;
                display: flex;
            }
            .assets-bar {
                height: 100%;
                background-color: #75b798;
                transition: width 0.3s ease;
            }
            .liabilities-bar {
                height: 100%;
                background-color: #dc3545;
                transition: width 0.3s ease;
                box-shadow: -2px 0 4px rgba(0,0,0,0.1);
            }
            .percentage-text {
                font-size: 13px;
                color: red;
                text-align: right;
                margin-top: 6px;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    function calculateNetAssets() {
        const assetsElement = document.getElementById('assets-amount');
        const liabilitiesElement = document.getElementById('liabilities-amount');

        if (assetsElement && liabilitiesElement) {
            const assets = parseFloat(assetsElement.textContent.replace(/[$,]/g, ''));
            const liabilities = parseFloat(liabilitiesElement.textContent.replace(/[$,]/g, ''));
            const netAssets = assets - liabilities;
            const liabilitiesPercentage = (liabilities / assets) * 100;
            const assetsPercentage = 100 - liabilitiesPercentage;

            const valuesContainer = document.createElement('div');
            valuesContainer.className = 'values-container';
            valuesContainer.innerHTML = `
                <div class="value-group">
                    <div class="value-label">Assets</div>
                    <div class="value-amount amount-assets">$${assets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="value-group">
                    <div class="value-label">Liabilities</div>
                    <div class="value-amount amount-liabilities">$${liabilities.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="value-group net-group">
                    <div class="value-label">USB Net Assets</div>
                    <div class="value-amount amount-net">$${netAssets.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="progress-container">
                    <div class="net-worth-progress-container">
                        <div class="assets-bar" style="width: ${assetsPercentage}%"></div>
                        <div class="liabilities-bar" style="width: ${liabilitiesPercentage}%"></div>
                    </div>
                    <div class="percentage-text">
                        ${liabilitiesPercentage.toFixed(1)}% of USB assets are offset by liabilities
                    </div>
                </div>
            `;

            const accordionPanel = document.querySelector('.accordion-panel__header');
            const existingContent = document.querySelector('.AccordionTitleHub__HeadingContainer-sc-1mxccrq-0');

            if (accordionPanel && existingContent) {
                existingContent.innerHTML = '';
                existingContent.appendChild(valuesContainer);
            }
        }
    }

    function init() {
        addStyles();

        const observer = new MutationObserver((mutations, obs) => {
            const assetsElement = document.getElementById('assets-amount');
            const liabilitiesElement = document.getElementById('liabilities-amount');

            if (assetsElement && liabilitiesElement) {
                calculateNetAssets();
                obs.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    init();
})();
