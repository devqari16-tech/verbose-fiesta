

// Initialize EmailJS - Update this public key from your EmailJS dashboard
(function() {
    try {
        emailjs.init("LQEalRlO-m3cl48NP"); // Use the simple init method first
        console.log('EmailJS initialized successfully');
    } catch (error) {
        console.error('EmailJS initialization failed:', error);
        alert('EmailJS initialization failed. Please check the public key.');
    }
})();

// Secure credentials (encoded for basic security)
const STAFF_CREDENTIALS = {
    'afgadmin': atob('QUZHNTU1VG93aW5nMjAyNSE='),
    'manager': atob('VG93TWFuYWdlckAyMDI1'),
    'dispatcher': atob('RGlzcGF0Y2hlclBAc3M=')
};

let currentUser = null;
let invoices = JSON.parse(localStorage.getItem('afgInvoices')) || [];
let invoiceCounter = parseInt(localStorage.getItem('afgInvoiceCounter')) || 1000;
let currentInvoiceData = null;

// Predefined service prices for quick selection
const SERVICE_PRICES = {
    'Car Towing': 150.00,
    'Snow Winch Out': 100.00,
    'Tire Change': 50.00,
    'Battery Boost': 75.00,
    'Lockout Service': 60.00,
    'Gas Delivery': 40.00,
    'Air Delivery': 25.00,
    'Tire Patch': 30.00,
    'Off-Rim Tire Change': 80.00,
    'Battery Installation': 120.00,
    'Emergency Response': 200.00
};

// Login functionality
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (STAFF_CREDENTIALS[username] && STAFF_CREDENTIALS[username] === password) {
        currentUser = username;
        showSuccess('Login successful! Welcome to the advanced dashboard.');
        setTimeout(() => {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            loadInvoices();
            initializeLivePreview();
        }, 1500);
    } else {
        document.getElementById('errorMessage').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorMessage').style.display = 'none';
        }, 4000);
    }
});

// Success message function
function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    document.getElementById('successText').textContent = message;
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    currentUser = null;
    currentInvoiceData = null;
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('sendEmailBtn').style.display = 'none';
});

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.dataset.tab;

        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Add service item
document.getElementById('addServiceBtn').addEventListener('click', function() {
    const servicesContainer = document.getElementById('servicesContainer');
    const newService = document.createElement('div');
    newService.className = 'service-item';
    newService.innerHTML = `
        <div class="form-group">
            <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Qty</label>
            <input type="number" class="service-quantity" min="1" value="1" required>
        </div>
        <div class="form-group">
            <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Service/Product Description *</label>
            <select class="service-description" required>
                <option value="">Select Service</option>
                <option value="Car Towing">Car Towing</option>
                <option value="Snow Winch Out">Snow Winch Out</option>
                <option value="Tire Change">Tire Change</option>
                <option value="Battery Boost">Battery Boost</option>
                <option value="Lockout Service">Lockout Service</option>
                <option value="Gas Delivery">Gas Delivery</option>
                <option value="Air Delivery">Air Delivery</option>
                <option value="Tire Patch">Tire Patch</option>
                <option value="Off-Rim Tire Change">Off-Rim Tire Change</option>
                <option value="Battery Installation">Battery Installation</option>
                <option value="Emergency Response">Emergency Response</option>
                <option value="Other">Other (Custom)</option>
            </select>
        </div>
        <div class="form-group">
            <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Model/Type</label>
            <input type="text" class="service-model" placeholder="Model/Type">
        </div>
        <div class="form-group">
            <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Price ($)</label>
            <input type="number" class="service-price" step="0.01" placeholder="0.00" required>
        </div>
        <button type="button" class="remove-service-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add event listeners to new service item
    addServiceEventListeners(newService);
    servicesContainer.appendChild(newService);
    updateCalculations();
});

// Add event listeners to service items
function addServiceEventListeners(serviceItem) {
    // Auto-populate price when service is selected
    const serviceSelect = serviceItem.querySelector('.service-description');
    const priceInput = serviceItem.querySelector('.service-price');
    
    serviceSelect.addEventListener('change', function() {
        if (SERVICE_PRICES[this.value]) {
            priceInput.value = SERVICE_PRICES[this.value].toFixed(2);
        }
        updateCalculations();
        updateLivePreview();
    });

    // Update calculations when quantity or price changes
    serviceItem.querySelector('.service-quantity').addEventListener('input', function() {
        updateCalculations();
        updateLivePreview();
    });

    priceInput.addEventListener('input', function() {
        updateCalculations();
        updateLivePreview();
    });

    // Remove service functionality
    serviceItem.querySelector('.remove-service-btn').addEventListener('click', function() {
        const servicesContainer = document.getElementById('servicesContainer');
        if (servicesContainer.children.length > 1) {
            serviceItem.remove();
            updateCalculations();
            updateLivePreview();
        }
    });
}

// Initialize event listeners for existing service items
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.service-item').forEach(addServiceEventListeners);
    
    // Add event listeners for tax rate and deposit changes
    document.getElementById('taxRate').addEventListener('input', function() {
        updateCalculations();
        updateLivePreview();
    });

    document.getElementById('depositPaid').addEventListener('input', function() {
        updateCalculations();
        updateLivePreview();
    });

    // Add event listeners for all form fields to update live preview
    const formFields = [
        'customerName', 'customerEmail', 'customerPhone', 'customerAddress',
        'vehicleYear', 'vehicleMake', 'vehicleModel', 'vehicleColor',
        'warrantyInfo', 'specialInstructions', 'internalNotes'
    ];

    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updateLivePreview);
        }
    });

    // Set today's date as default
    document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
});

// Update calculations
function updateCalculations() {
    const serviceItems = document.querySelectorAll('.service-item');
    let subtotal = 0;

    serviceItems.forEach(item => {
        const quantity = parseFloat(item.querySelector('.service-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.service-price').value) || 0;
        subtotal += quantity * price;
    });

    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    const deposit = parseFloat(document.getElementById('depositPaid').value) || 0;
    const balance = total - deposit;

    // Update form fields
    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('taxAmount').value = taxAmount.toFixed(2);
    document.getElementById('totalAmount').value = total.toFixed(2);
    document.getElementById('balanceDue').value = balance.toFixed(2);

    // Update preview totals
    document.getElementById('previewSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('previewTax').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('previewTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('previewDeposit').textContent = `$${deposit.toFixed(2)}`;
    document.getElementById('previewBalance').textContent = `$${balance.toFixed(2)}`;
}

// Initialize live preview
function initializeLivePreview() {
    updateLivePreview();
}

// Update live preview
function updateLivePreview() {
    const preview = document.getElementById('invoicePreview');
    preview.classList.add('preview-updating');
    
    setTimeout(() => {
        const customerName = document.getElementById('customerName').value || 'Customer Name';
        const customerEmail = document.getElementById('customerEmail').value || 'customer@email.com';
        const customerPhone = document.getElementById('customerPhone').value || 'Phone Number';
        const customerAddress = document.getElementById('customerAddress').value || 'Customer Address';
        const serviceDate = document.getElementById('serviceDate').value || new Date().toISOString().split('T')[0];
        
        const vehicleYear = document.getElementById('vehicleYear').value || '';
        const vehicleMake = document.getElementById('vehicleMake').value || '';
        const vehicleModel = document.getElementById('vehicleModel').value || '';
        const vehicleColor = document.getElementById('vehicleColor').value || '';
        const vehicleInfo = `${vehicleYear} ${vehicleMake} ${vehicleModel} ${vehicleColor}`.trim() || 'Vehicle Information';

        const warrantyInfo = document.getElementById('warrantyInfo').value || 'Standard warranty applies';
        const specialInstructions = document.getElementById('specialInstructions').value || 'No special instructions';

        const subtotal = document.getElementById('subtotal').value || '0.00';
        const taxAmount = document.getElementById('taxAmount').value || '0.00';
        const totalAmount = document.getElementById('totalAmount').value || '0.00';
        const depositPaid = document.getElementById('depositPaid').value || '0.00';
        const balanceDue = document.getElementById('balanceDue').value || '0.00';

        // Generate service rows
        const serviceItems = document.querySelectorAll('.service-item');
        let serviceRows = '';
        
        serviceItems.forEach((item, index) => {
            const quantity = item.querySelector('.service-quantity').value || '1';
            const description = item.querySelector('.service-description').value || 'Service Description';
            const model = item.querySelector('.service-model').value || '';
            const price = item.querySelector('.service-price').value || '0.00';
            const itemTotal = (parseFloat(quantity) * parseFloat(price)).toFixed(2);

            serviceRows += `
                <tr>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${quantity}</td>
                    <td style="border: 1px solid #000; padding: 8px;">${description}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">${model}</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: center;">-</td>
                    <td style="border: 1px solid #000; padding: 8px; text-align: right;">$${itemTotal}</td>
                </tr>
            `;
        });

        // Add empty rows to fill the table
        for (let i = serviceItems.length; i < 7; i++) {
            serviceRows += `
                <tr>
                    <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                    <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                    <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                    <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                    <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                </tr>
            `;
        }

        preview.innerHTML = `
            <table style="max-width: 100%; margin: 0 auto; background-color: white; border: 2px solid #000; border-collapse: collapse; width: 100%;">
                <!-- Header -->
                <tr>
                    <td style="text-align: center; padding: 20px; border-bottom: 2px solid #000;">
                        <h1 style="font-size: 18px; font-weight: bold; margin: 0;">AFG555TOWING</h1>
                        <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">Professional Roadside Assistance & Towing Services</p>
                        <div style="margin-top: 15px; font-size: 12px; line-height: 1.4;">
                            <strong>Emergency Hotline: +1 (647) 819-4452</strong><br>
                            Email: info@afg555towing.com | 24/7 Emergency Service
                        </div>
                    </td>
                </tr>

                <!-- Customer Information -->
                <tr>
                    <td style="padding: 15px 20px; border-bottom: 1px solid #000;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 4px 0;">
                                    <strong>Customer:</strong> ${customerName}
                                </td>
                                <td style="padding: 4px 0; text-align: right;">
                                    <strong>Date:</strong> ${new Date(serviceDate).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">
                                    <strong>Phone:</strong> ${customerPhone}
                                </td>
                                <td style="padding: 4px 0; text-align: right;">
                                    <strong>Vehicle:</strong> ${vehicleInfo}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 4px 0;">
                                    <strong>Address:</strong> ${customerAddress}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 4px 0;">
                                    <strong>Invoice ID:</strong> AFG-${invoiceCounter + 1}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Service Items Table -->
                <tr>
                    <td style="padding: 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f0f0f0;">
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 60px;">Qty</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Description</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 80px;">Model</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 80px;">Serial #</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 100px;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${serviceRows}
                            </tbody>
                        </table>
                    </td>
                </tr>

                <!-- Notes and Totals Section -->
                <tr>
                    <td style="padding: 0; border-top: 1px solid #000;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 60%; padding: 15px; border-right: 1px solid #000; vertical-align: top;">
                                    <strong>Notes:</strong>
                                    <div style="font-size: 12px; line-height: 1.3; margin-top: 5px;">
                                        ${specialInstructions}
                                        <br><br>
                                        <strong>Warranty:</strong><br>
                                        ${warrantyInfo}
                                    </div>
                                </td>
                                <td style="width: 40%; padding: 15px; vertical-align: top;">
                                    <table style="width: 100%; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 3px 0;">Sub Total</td>
                                            <td style="text-align: right; padding: 3px 0;">$${subtotal}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 3px 0;">Tax (${document.getElementById('taxRate').value || 13}%)</td>
                                            <td style="text-align: right; padding: 3px 0;">$${taxAmount}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #000; font-weight: bold;">
                                            <td style="padding: 8px 0 3px 0;">Total</td>
                                            <td style="text-align: right; padding: 8px 0 3px 0;">$${totalAmount}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0 3px 0;">Deposit</td>
                                            <td style="text-align: right; padding: 15px 0 3px 0;">$${depositPaid}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #000; font-weight: bold;">
                                            <td style="padding: 8px 0 3px 0;">Balance</td>
                                            <td style="text-align: right; padding: 8px 0 3px 0;">$${balanceDue}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Warranty Section -->
                <tr>
                    <td style="text-align: center; padding: 15px; border-top: 2px solid #000;">
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">Professional Roadside Assistance Services</div>
                        <table style="width: 100%; margin-top: 20px;">
                            <tr>
                                <td style="font-weight: bold; width: 150px;">Customer's Signature X</td>
                                <td style="border-bottom: 1px solid #000; height: 20px;"></td>
                            </tr>
                        </table>
                        <p style="margin-top: 15px; font-size: 12px; color: #666;">Thank you for choosing AFG555TOWING - Your trusted roadside assistance partner!</p>
                    </td>
                </tr>
            </table>
        `;
        
        preview.classList.remove('preview-updating');
    }, 100);
}

// Generate invoice
document.getElementById('invoiceForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const serviceDate = document.getElementById('serviceDate').value;
    
    const vehicleYear = document.getElementById('vehicleYear').value;
    const vehicleMake = document.getElementById('vehicleMake').value;
    const vehicleModel = document.getElementById('vehicleModel').value;
    const vehicleColor = document.getElementById('vehicleColor').value;
    const vehicleInfo = `${vehicleYear} ${vehicleMake} ${vehicleModel} ${vehicleColor}`.trim();
    
    const specialInstructions = document.getElementById('specialInstructions').value;
    const warrantyInfo = document.getElementById('warrantyInfo').value;
    const internalNotes = document.getElementById('internalNotes').value;

    const services = [];
    const serviceItems = document.querySelectorAll('.service-item');

    serviceItems.forEach(item => {
        const description = item.querySelector('.service-description').value;
        const quantity = parseInt(item.querySelector('.service-quantity').value);
        const model = item.querySelector('.service-model').value;
        const price = parseFloat(item.querySelector('.service-price').value);

        if (description && quantity && price) {
            services.push({
                description,
                quantity,
                model: model || '',
                serial: '', // Not used in this version
                price,
                total: quantity * price
            });
        }
    });

    if (services.length === 0) {
        alert('Please add at least one service item.');
        return;
    }

    const subtotal = parseFloat(document.getElementById('subtotal').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value);
    const taxAmount = parseFloat(document.getElementById('taxAmount').value);
    const total = parseFloat(document.getElementById('totalAmount').value);
    const deposit = parseFloat(document.getElementById('depositPaid').value);
    const balance = parseFloat(document.getElementById('balanceDue').value);

    const invoice = {
        id: ++invoiceCounter,
        number: `AFG-${invoiceCounter}`,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: customerAddress || '',
        serviceDate,
        vehicleInfo: vehicleInfo || '',
        vehicleYear,
        vehicleMake,
        vehicleModel,
        vehicleColor,
        specialInstructions: specialInstructions || '',
        warrantyInfo: warrantyInfo || '',
        internalNotes: internalNotes || '',
        services,
        subtotal,
        taxRate,
        taxAmount,
        deposit,
        total,
        balance,
        status: 'pending',
        createdDate: new Date().toISOString(),
        createdBy: currentUser
    };

    invoices.unshift(invoice);
    currentInvoiceData = invoice;
    saveData();
    loadInvoices();

    // Show email button
    document.getElementById('sendEmailBtn').style.display = 'inline-flex';

    // Send email automatically
    sendInvoiceEmail(invoice);

    // Reset form
    resetInvoiceForm();

    alert(`Invoice ${invoice.number} created and sent successfully!`);
});

// Send email functionality
document.getElementById('sendEmailBtn').addEventListener('click', function() {
    if (!currentInvoiceData) {
        alert('No invoice data available. Please generate an invoice first.');
        return;
    }

    sendInvoiceEmail(currentInvoiceData);
});

// Send invoice via EmailJS
function sendInvoiceEmail(invoice) {
    // Validate EmailJS is properly initialized
    if (typeof emailjs === 'undefined') {
        alert('EmailJS is not loaded. Please refresh the page and try again.');
        return;
    }

    const btn = document.getElementById('sendEmailBtn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    // Prepare service items for email template
    const serviceItems = {};
    for (let i = 0; i < 5; i++) {
        const service = invoice.services[i];
        if (service) {
            serviceItems[`service${i + 1}_qty`] = service.quantity;
            serviceItems[`service${i + 1}_desc`] = service.description;
            serviceItems[`service${i + 1}_model`] = service.model;
            serviceItems[`service${i + 1}_serial`] = service.serial || '';
            serviceItems[`service${i + 1}_amount`] = `$${service.total.toFixed(2)}`;
        } else {
            serviceItems[`service${i + 1}_qty`] = '';
            serviceItems[`service${i + 1}_desc`] = '';
            serviceItems[`service${i + 1}_model`] = '';
            serviceItems[`service${i + 1}_serial`] = '';
            serviceItems[`service${i + 1}_amount`] = '';
        }
    }

    const templateParams = {
        to_email: invoice.customerEmail,
        to_name: invoice.customerName,
        customer_name: invoice.customerName,
        customer_phone: invoice.customerPhone,
        customer_address: invoice.customerAddress,
        invoice_date: new Date(invoice.serviceDate).toLocaleDateString(),
        vehicle_details: invoice.vehicleInfo,
        invoice_id: invoice.number,
        special_instructions: invoice.specialInstructions,
        warranty_info: invoice.warrantyInfo,
        subtotal: invoice.subtotal.toFixed(2),
        tax: invoice.taxAmount.toFixed(2),
        total: invoice.total.toFixed(2),
        deposit: invoice.deposit.toFixed(2),
        balance: invoice.balance.toFixed(2),
        ...serviceItems
    };

    emailjs.send('service_d6r1qio', 'template_xk5pqew', templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response.status, response.text);
            alert(`Invoice emailed successfully to ${invoice.customerEmail}!`);
            
            // Update invoice status to indicate email was sent
            invoice.emailSent = true;
            invoice.emailSentDate = new Date().toISOString();
            saveData();
            loadInvoices();
        })
        .catch(function(error) {
            console.error('Email sending failed:', error);
            if (error.text) {
                alert(`Failed to send email: ${error.text}`);
            } else {
                alert('Failed to send email. Please verify your EmailJS configuration and try again.');
            }
        })
        .finally(function() {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}

// Reset invoice form
function resetInvoiceForm() {
    document.getElementById('invoiceForm').reset();
    
    // Reset services to just one
    const servicesContainer = document.getElementById('servicesContainer');
    servicesContainer.innerHTML = `
        <div class="service-item">
            <div class="form-group">
                <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Qty</label>
                <input type="number" class="service-quantity" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Service/Product Description *</label>
                <select class="service-description" required>
                    <option value="">Select Service</option>
                    <option value="Car Towing">Car Towing</option>
                    <option value="Snow Winch Out">Snow Winch Out</option>
                    <option value="Tire Change">Tire Change</option>
                    <option value="Battery Boost">Battery Boost</option>
                    <option value="Lockout Service">Lockout Service</option>
                    <option value="Gas Delivery">Gas Delivery</option>
                    <option value="Air Delivery">Air Delivery</option>
                    <option value="Tire Patch">Tire Patch</option>
                    <option value="Off-Rim Tire Change">Off-Rim Tire Change</option>
                    <option value="Battery Installation">Battery Installation</option>
                    <option value="Emergency Response">Emergency Response</option>
                    <option value="Other">Other (Custom)</option>
                </select>
            </div>
            <div class="form-group">
                <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Model/Type</label>
                <input type="text" class="service-model" placeholder="Model/Type">
            </div>
            <div class="form-group">
                <label style="color: rgba(255,255,255,0.7); font-size: 12px;">Price ($)</label>
                <input type="number" class="service-price" step="0.01" placeholder="0.00" required>
            </div>
            <button type="button" class="remove-service-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Re-add event listeners to the new service item
    addServiceEventListeners(servicesContainer.querySelector('.service-item'));
    
    // Reset calculations and preview
    document.getElementById('taxRate').value = '13';
    updateCalculations();
    updateLivePreview();
    
    // Hide email button
    document.getElementById('sendEmailBtn').style.display = 'none';
    currentInvoiceData = null;
    
    // Set today's date as default
    document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
}

// Load and display invoices
function loadInvoices() {
    const container = document.getElementById('invoicesList');
    container.innerHTML = '';

    if (invoices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; background: rgba(26,26,26,0.7); border-radius: 20px;">
                <i class="fas fa-file-invoice" style="font-size: 4rem; color: #ffc107; margin-bottom: 20px;"></i>
                <p style="color: rgba(255,255,255,0.6); font-size: 1.2rem;">No invoices created yet.</p>
                <p style="color: rgba(255,255,255,0.4);">Create your first invoice using the form above.</p>
            </div>
        `;
        return;
    }

    invoices.forEach(invoice => {
        const invoiceCard = document.createElement('div');
        invoiceCard.className = 'invoice-card';
        
        const emailStatus = invoice.emailSent ? 
            `<span style="color: #22c55e; font-size: 0.9rem;"><i class="fas fa-check-circle"></i> Email Sent</span>` : 
            `<span style="color: #fbbf24; font-size: 0.9rem;"><i class="fas fa-clock"></i> Not Emailed</span>`;
        
        invoiceCard.innerHTML = `
            <div class="invoice-header">
                <span class="invoice-number">${invoice.number}</span>
                <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                    <span class="invoice-status status-${invoice.status}">
                        ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    ${emailStatus}
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                <div>
                    <strong style="color: #ffc107;">Customer:</strong><br>
                    <span style="color: white;">${invoice.customerName}</span><br>
                    <span style="color: rgba(255,255,255,0.7);">${invoice.customerPhone}</span><br>
                    <span style="color: rgba(255,255,255,0.7);">${invoice.customerEmail}</span>
                </div>
                <div>
                    <strong style="color: #ffc107;">Service Date:</strong><br>
                    <span style="color: white;">${new Date(invoice.serviceDate).toLocaleDateString()}</span>
                </div>
                <div>
                    <strong style="color: #ffc107;">Vehicle:</strong><br>
                    <span style="color: white;">${invoice.vehicleInfo || 'N/A'}</span>
                </div>
                <div>
                    <strong style="color: #ffc107;">Total Amount:</strong><br>
                    <span style="color: #22c55e; font-size: 1.3rem; font-weight: 700;">$${invoice.total.toFixed(2)}</span>
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="viewInvoice('${invoice.number}')" style="background: #0099ff; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button onclick="toggleInvoiceStatus('${invoice.number}')" style="background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-check"></i> Mark ${invoice.status === 'pending' ? 'Paid' : 'Pending'}
                </button>
                <button onclick="printInvoice('${invoice.number}')" style="background: #ffc107; color: #000; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-print"></i> Print
                </button>
                ${!invoice.emailSent ? `<button onclick="resendEmail('${invoice.number}')" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-envelope"></i> Send Email
                </button>` : ''}
            </div>
        `;
        container.appendChild(invoiceCard);
    });
}

// Resend email function
function resendEmail(invoiceNumber) {
    const invoice = invoices.find(inv => inv.number === invoiceNumber);
    if (invoice) {
        sendInvoiceEmail(invoice);
    }
}

// Toggle invoice status
function toggleInvoiceStatus(invoiceNumber) {
    const invoice = invoices.find(inv => inv.number === invoiceNumber);
    if (invoice) {
        invoice.status = invoice.status === 'pending' ? 'paid' : 'pending';
        saveData();
        loadInvoices();
    }
}

// View invoice details
function viewInvoice(invoiceNumber) {
    const invoice = invoices.find(inv => inv.number === invoiceNumber);
    if (!invoice) return;

    const servicesList = invoice.services.map(service => 
        `• ${service.description} (${service.model || 'N/A'}) - Qty: ${service.quantity} × $${service.price.toFixed(2)} = $${service.total.toFixed(2)}`
    ).join('\n');

    const details = `Invoice: ${invoice.number}
    
Customer Information:
• Name: ${invoice.customerName}
• Email: ${invoice.customerEmail}
• Phone: ${invoice.customerPhone}
• Address: ${invoice.customerAddress || 'Not provided'}

Vehicle Information:
• Vehicle: ${invoice.vehicleInfo || 'Not specified'}
• Year: ${invoice.vehicleYear || 'N/A'}
• Make: ${invoice.vehicleMake || 'N/A'}
• Model: ${invoice.vehicleModel || 'N/A'}
• Color: ${invoice.vehicleColor || 'N/A'}

Service Details:
• Date: ${new Date(invoice.serviceDate).toLocaleDateString()}

Services Provided:
${servicesList}

Financial Summary:
• Subtotal: $${invoice.subtotal.toFixed(2)}
• Tax Rate: ${invoice.taxRate}%
• Tax Amount: $${invoice.taxAmount.toFixed(2)}
• Total: $${invoice.total.toFixed(2)}
• Deposit: $${invoice.deposit.toFixed(2)}
• Balance Due: $${invoice.balance.toFixed(2)}

Status: ${invoice.status.toUpperCase()}
Email Status: ${invoice.emailSent ? 'SENT' : 'NOT SENT'}

Notes: ${invoice.specialInstructions || 'None'}
Warranty: ${invoice.warrantyInfo || 'Standard warranty applies'}
Internal Notes: ${invoice.internalNotes || 'None'}`;

    alert(details);
}

// Print invoice function (enhanced)
function printInvoice(invoiceNumber) {
    const invoice = invoices.find(inv => inv.number === invoiceNumber);
    if (!invoice) return;

    const printWindow = window.open('', '_blank');
    
    // Prepare service items for print template
    let serviceRows = '';
    for (let i = 0; i < invoice.services.length; i++) {
        const service = invoice.services[i];
        serviceRows += `
            <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${service.quantity}</td>
                <td style="border: 1px solid #000; padding: 8px;">${service.description}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${service.model}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${service.serial || '-'}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">$${service.total.toFixed(2)}</td>
            </tr>
        `;
    }
    
    // Add empty rows if less than 7 items
    for (let i = invoice.services.length; i < 7; i++) {
        serviceRows += `
            <tr>
                <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
                <td style="border: 1px solid #000; padding: 8px;">&nbsp;</td>
            </tr>
        `;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AFG555TOWING - Invoice ${invoice.number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #333;">
            <table style="max-width: 600px; margin: 0 auto; background-color: white; border: 2px solid #000; border-collapse: collapse; width: 100%;">
                <!-- Header -->
                <tr>
                    <td style="text-align: center; padding: 20px; border-bottom: 2px solid #000;">
                        <h1 style="font-size: 18px; font-weight: bold; margin: 0;">AFG555TOWING</h1>
                        <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">Professional Roadside Assistance & Towing Services</p>
                        <div style="margin-top: 15px; font-size: 12px; line-height: 1.4;">
                            <strong>Emergency Hotline: +1 (647) 819-4452</strong><br>
                            Email: info@afg555towing.com | 24/7 Emergency Service
                        </div>
                    </td>
                </tr>

                <!-- Customer Information -->
                <tr>
                    <td style="padding: 15px 20px; border-bottom: 1px solid #000;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 4px 0;">
                                    <strong>Customer:</strong> ${invoice.customerName}
                                </td>
                                <td style="padding: 4px 0; text-align: right;">
                                    <strong>Date:</strong> ${new Date(invoice.serviceDate).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0;">
                                    <strong>Phone:</strong> ${invoice.customerPhone}
                                </td>
                                <td style="padding: 4px 0; text-align: right;">
                                    <strong>Vehicle:</strong> ${invoice.vehicleInfo}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 4px 0;">
                                    <strong>Address:</strong> ${invoice.customerAddress}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 4px 0;">
                                    <strong>Invoice ID:</strong> ${invoice.number}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Service Items Table -->
                <tr>
                    <td style="padding: 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f0f0f0;">
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 60px;">Qty</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">Description</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 80px;">Model</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 80px;">Serial #</th>
                                    <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; width: 100px;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${serviceRows}
                            </tbody>
                        </table>
                    </td>
                </tr>

                <!-- Notes and Totals Section -->
                <tr>
                    <td style="padding: 0; border-top: 1px solid #000;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="width: 60%; padding: 15px; border-right: 1px solid #000; vertical-align: top;">
                                    <strong>Notes:</strong>
                                    <div style="font-size: 12px; line-height: 1.3; margin-top: 5px;">
                                        ${invoice.specialInstructions || 'Thank you for choosing AFG555TOWING for your roadside assistance needs.'}
                                        <br><br>
                                        <strong>Warranty:</strong><br>
                                        ${invoice.warrantyInfo || 'Standard service warranty applies as per terms and conditions.'}
                                    </div>
                                </td>
                                <td style="width: 40%; padding: 15px; vertical-align: top;">
                                    <table style="width: 100%; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 3px 0;">Sub Total</td>
                                            <td style="text-align: right; padding: 3px 0;">$${invoice.subtotal.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 3px 0;">Tax (${invoice.taxRate}%)</td>
                                            <td style="text-align: right; padding: 3px 0;">$${invoice.taxAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #000; font-weight: bold;">
                                            <td style="padding: 8px 0 3px 0;">Total</td>
                                            <td style="text-align: right; padding: 8px 0 3px 0;">$${invoice.total.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0 3px 0;">Deposit</td>
                                            <td style="text-align: right; padding: 15px 0 3px 0;">$${invoice.deposit.toFixed(2)}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #000; font-weight: bold;">
                                            <td style="padding: 8px 0 3px 0;">Balance</td>
                                            <td style="text-align: right; padding: 8px 0 3px 0;">$${invoice.balance.toFixed(2)}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Warranty Section -->
                <tr>
                    <td style="text-align: center; padding: 15px; border-top: 2px solid #000;">
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">Professional Roadside Assistance Services</div>
                        <table style="width: 100%; margin-top: 20px;">
                            <tr>
                                <td style="font-weight: bold; width: 150px;">Customer's Signature X</td>
                                <td style="border-bottom: 1px solid #000; height: 20px;"></td>
                            </tr>
                        </table>
                        <p style="margin-top: 15px; font-size: 12px; color: #666;">Thank you for choosing AFG555TOWING - Your trusted roadside assistance partner!</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('afgInvoices', JSON.stringify(invoices));
    localStorage.setItem('afgInvoiceCounter', invoiceCounter.toString());
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
    
    console.log('AFG555TOWING Advanced Invoice Management System Initialized');
    console.log('EmailJS Service ID: service_d6r1qio');
    console.log('Template ID: template_xk5pqew');
    console.log('Features: Live Preview, Enhanced Vehicle Info, Advanced Calculations');
});

