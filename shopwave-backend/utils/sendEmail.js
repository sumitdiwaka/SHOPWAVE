import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 36px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">🛒 ShopWave</h1>
      <p style="margin:5px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">India's Multi-Vendor Marketplace</p>
    </div>
    <div style="padding:32px 36px;">${content}</div>
    <div style="background:#f8fafc;padding:18px 36px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} ShopWave — This email was sent automatically.</p>
    </div>
  </div>
</body>
</html>`;

const btn = (text, url, color = '#6366f1') =>
  `<a href="${url}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:11px 26px;border-radius:10px;font-size:14px;font-weight:700;margin:8px 4px;">${text}</a>`;

const badge = (text, bg = '#eef2ff', color = '#6366f1') =>
  `<span style="background:${bg};color:${color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${text}</span>`;

const row = (label, value) =>
  `<tr><td style="padding:5px 0;color:#6b7280;width:38%;font-size:14px;">${label}</td><td style="padding:5px 0;font-weight:600;color:#111827;font-size:14px;">${value}</td></tr>`;

// ── Core send ────────────────────────────────────────────
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    console.log(`📧 Email sent → ${to} | ${subject}`);
  } catch (err) {
    console.error(`❌ Email FAILED → ${to}:`, err.message);
  }
};

// ════════════════════════════════════════════════════════
//  1. WELCOME — new user registered
// ════════════════════════════════════════════════════════
export const welcomeEmail = (user) => ({
  to: user.email,
  subject: 'Welcome to ShopWave! 🎉',
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Welcome, ${user.name}! 🎉</h2>
    <p style="color:#6b7280;margin:0 0 20px;line-height:1.6;">Your account is ready. Start exploring thousands of products from verified vendors.</p>
    <div style="background:#eef2ff;border-radius:12px;padding:18px;margin:0 0 24px;">
      <p style="margin:0 0 10px;font-weight:700;color:#4338ca;font-size:14px;">What you can do:</p>
      <ul style="margin:0;padding-left:18px;color:#374151;line-height:2.2;font-size:14px;">
        <li>Browse thousands of products</li>
        <li>Save favourites to your Wishlist</li>
        <li>Track all your orders in real-time</li>
        <li>Write reviews after purchase</li>
      </ul>
    </div>
    <div style="text-align:center;">${btn('Start Shopping →', `${process.env.CLIENT_URL}/products`)}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  2. VENDOR APPLICATION → email sent to VENDOR
// ════════════════════════════════════════════════════════
export const vendorApplicationEmail = (user, vendor) => ({
  to: user.email,
  subject: '✅ Vendor Application Received — ShopWave',
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;">Application Received! 🏪</h2>
    <p style="color:#6b7280;margin:0 0 20px;line-height:1.6;">Hi <strong>${user.name}</strong>, your vendor application for <strong>${vendor.shopName}</strong> has been submitted successfully.</p>

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:18px;margin:0 0 20px;">
      <p style="margin:0 0 10px;font-weight:700;color:#92400e;font-size:14px;">📋 Your Application Details</p>
      <table style="width:100%;">
        ${row('Shop Name', vendor.shopName)}
        ${row('Category', vendor.category)}
        ${row('Status', badge('Under Review ⏳', '#fef3c7', '#d97706'))}
      </table>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;margin:0 0 20px;">
      <p style="margin:0;color:#166534;font-size:13px;line-height:1.7;">⏳ <strong>What's next?</strong> Our admin team reviews applications within 24 hours. You will receive another email once your application is <strong>approved or rejected</strong>.</p>
    </div>
  `),
});

// ════════════════════════════════════════════════════════
//  3. VENDOR APPLICATION → email sent to ADMIN
// ════════════════════════════════════════════════════════
export const adminNewVendorEmail = (adminEmail, user, vendor) => ({
  to: adminEmail,
  subject: `🔔 New Vendor Application — ${vendor.shopName} | ShopWave Admin`,
  html: baseTemplate(`
    <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:12px;padding:16px 20px;margin:0 0 24px;text-align:center;">
      <p style="margin:0;font-size:18px;font-weight:800;color:#92400e;">⚠️ Action Required</p>
      <p style="margin:4px 0 0;color:#b45309;font-size:13px;">A new vendor application needs your review</p>
    </div>

    <h2 style="color:#111827;margin:0 0 8px;font-size:20px;">New Vendor Application</h2>
    <p style="color:#6b7280;margin:0 0 20px;line-height:1.6;">A user has submitted a vendor application on ShopWave. Please review and take action.</p>

    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin:0 0 24px;">
      <p style="margin:0 0 12px;font-weight:700;color:#374151;font-size:14px;">👤 Applicant Details</p>
      <table style="width:100%;">
        ${row('Full Name', user.name)}
        ${row('Email', `<a href="mailto:${user.email}" style="color:#6366f1;">${user.email}</a>`)}
        ${row('Shop Name', `<strong>${vendor.shopName}</strong>`)}
        ${row('Category', vendor.category)}
        ${row('GST Number', vendor.gstNumber || 'Not provided')}
        ${row('Applied At', new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))}
      </table>
      ${vendor.shopDescription ? `<p style="margin:12px 0 0;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px;"><strong>Description:</strong> ${vendor.shopDescription}</p>` : ''}
    </div>

    <div style="text-align:center;margin:0 0 8px;">
      <p style="color:#374151;font-weight:600;font-size:14px;margin:0 0 12px;">Take action from the admin panel:</p>
      ${btn('✅ Go to Vendor Approvals', `${process.env.CLIENT_URL}/admin/vendors`, '#16a34a')}
      ${btn('📊 Admin Dashboard', `${process.env.CLIENT_URL}/admin/dashboard`, '#6366f1')}
    </div>
  `),
});

// ════════════════════════════════════════════════════════
//  4. VENDOR APPROVED → email sent to VENDOR
// ════════════════════════════════════════════════════════
export const vendorApprovedEmail = (user, vendor) => ({
  to: user.email,
  subject: '🎉 Your Vendor Application is APPROVED — ShopWave',
  html: baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:52px;line-height:1;">🎉</div>
      <h2 style="color:#111827;margin:12px 0 6px;font-size:24px;">Congratulations, ${user.name}!</h2>
      <p style="color:#6b7280;margin:0;">Your vendor application has been <strong style="color:#16a34a;">approved!</strong></p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin:0 0 20px;">
      <p style="margin:0 0 10px;font-weight:700;color:#15803d;font-size:14px;">✅ Shop Approved</p>
      <table style="width:100%;">
        ${row('Shop Name', vendor.shopName)}
        ${row('Category', vendor.category)}
        ${row('Status', badge('Approved ✓', '#dcfce7', '#16a34a'))}
      </table>
    </div>

    <div style="background:#eef2ff;border-radius:12px;padding:18px;margin:0 0 24px;">
      <p style="margin:0 0 10px;font-weight:700;color:#4338ca;font-size:14px;">🚀 Get started in 3 steps:</p>
      <ol style="margin:0;padding-left:18px;color:#374151;line-height:2.4;font-size:14px;">
        <li>Login to your ShopWave account</li>
        <li>Go to <strong>Vendor Dashboard → My Products</strong></li>
        <li>Click <strong>"Add Product"</strong> and start listing!</li>
      </ol>
    </div>

    <div style="text-align:center;">${btn('Go to Vendor Dashboard →', `${process.env.CLIENT_URL}/vendor/dashboard`, '#16a34a')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  5. VENDOR REJECTED → email sent to VENDOR
// ════════════════════════════════════════════════════════
export const vendorRejectedEmail = (user, vendor, reason = '') => ({
  to: user.email,
  subject: 'Vendor Application Update — ShopWave',
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Application Status Update</h2>
    <p style="color:#6b7280;margin:0 0 20px;line-height:1.6;">Hi <strong>${user.name}</strong>, we've reviewed your application for <strong>${vendor.shopName}</strong>.</p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-weight:700;color:#dc2626;font-size:14px;">Application Not Approved</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">
        ${reason ? `<strong>Reason:</strong> ${reason}` : 'Your application did not meet our current vendor requirements.'}
      </p>
    </div>

    <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-weight:600;color:#374151;font-size:14px;">You can improve and reapply:</p>
      <ul style="margin:0;padding-left:18px;color:#6b7280;font-size:13px;line-height:2.2;">
        <li>Complete your shop description</li>
        <li>Provide a valid GST number (if applicable)</li>
        <li>Ensure your business address is correct</li>
        <li>Choose the most accurate category for your products</li>
      </ul>
    </div>

    <div style="text-align:center;">${btn('Reapply as Vendor', `${process.env.CLIENT_URL}/vendor/register`, '#6366f1')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  6. NEW PRODUCT → customers
// ════════════════════════════════════════════════════════
export const newProductEmail = (customer, product, vendor) => ({
  to: customer.email,
  subject: `🆕 New Arrival: ${product.name} — ShopWave`,
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:20px;">New Product Just Arrived! 🆕</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Hi <strong>${customer.name}</strong>, check out this new listing from <strong>${vendor.shopName}</strong>!</p>

    <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:0 0 20px;">
      ${product.images?.[0]?.url ? `<img src="${product.images[0].url}" alt="${product.name}" style="width:100%;max-height:220px;object-fit:cover;"/>` : ''}
      <div style="padding:18px;">
        <p style="margin:0 0 4px;font-size:11px;color:#6366f1;font-weight:700;text-transform:uppercase;">${vendor.shopName} · ${product.category}</p>
        <h3 style="margin:4px 0 10px;font-size:17px;color:#111827;">${product.name}</h3>
        <div style="margin-bottom:14px;">
          <span style="font-size:22px;font-weight:800;color:#111827;">₹${(product.discountPrice > 0 ? product.discountPrice : product.price).toLocaleString('en-IN')}</span>
          ${product.discountPrice > 0 ? `<span style="margin-left:8px;font-size:14px;color:#9ca3af;text-decoration:line-through;">₹${product.price.toLocaleString('en-IN')}</span>
          <span style="margin-left:6px;background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:700;">${Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF</span>` : ''}
        </div>
        <div style="text-align:center;">${btn('View Product →', `${process.env.CLIENT_URL}/products/${product._id}`)}</div>
      </div>
    </div>
  `),
});

// ════════════════════════════════════════════════════════
//  7. SALE → customers
// ════════════════════════════════════════════════════════
export const saleProductEmail = (customer, product, vendor, discountPercent) => ({
  to: customer.email,
  subject: `🔥 ${discountPercent}% OFF Sale on ${product.name} — ShopWave`,
  html: baseTemplate(`
    <div style="text-align:center;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;padding:20px;margin:0 0 20px;">
      <div style="font-size:44px;line-height:1;">🔥</div>
      <h2 style="color:#92400e;margin:10px 0 4px;font-size:26px;font-weight:900;">${discountPercent}% OFF!</h2>
      <p style="color:#b45309;margin:0;font-size:14px;font-weight:600;">Limited Time Sale from ${vendor.shopName}</p>
    </div>
    <p style="color:#6b7280;margin:0 0 18px;">Hi <strong>${customer.name}</strong>, don't miss this deal!</p>
    <div style="border:2px solid #fde68a;border-radius:12px;overflow:hidden;margin:0 0 20px;">
      ${product.images?.[0]?.url ? `<img src="${product.images[0].url}" alt="${product.name}" style="width:100%;max-height:200px;object-fit:cover;"/>` : ''}
      <div style="padding:18px;background:#fffbeb;">
        <h3 style="margin:0 0 12px;font-size:17px;color:#111827;">${product.name}</h3>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
          <div>
            <p style="margin:0;font-size:12px;color:#9ca3af;text-decoration:line-through;">₹${product.price.toLocaleString('en-IN')}</p>
            <p style="margin:0;font-size:26px;font-weight:900;color:#dc2626;">₹${product.discountPrice.toLocaleString('en-IN')}</p>
          </div>
          <div style="background:#dc2626;color:#fff;padding:6px 14px;border-radius:8px;font-size:16px;font-weight:900;">
            SAVE ₹${(product.price - product.discountPrice).toLocaleString('en-IN')}
          </div>
        </div>
        <p style="margin:0 0 14px;color:#dc2626;font-size:13px;font-weight:600;">⚡ Only ${product.stock} left in stock!</p>
        <div style="text-align:center;">${btn('Shop the Sale Now 🛒', `${process.env.CLIENT_URL}/products/${product._id}`, '#dc2626')}</div>
      </div>
    </div>
  `),
});

// ════════════════════════════════════════════════════════
//  8. ORDER CONFIRMATION → customer
// ════════════════════════════════════════════════════════
export const orderConfirmationEmail = (order, user) => ({
  to: user.email,
  subject: `✅ Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} — ShopWave`,
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Order Confirmed! ✅</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Hi <strong>${user.name}</strong>, your order has been placed and is being processed.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin:0 0 20px;">
      <table style="width:100%;">
        ${row('Order ID', `<code style="font-family:monospace;font-size:13px;background:#dcfce7;padding:2px 6px;border-radius:4px;">${order._id}</code>`)}
        ${row('Total', `<strong style="font-size:18px;color:#16a34a;">₹${order.totalPrice.toLocaleString('en-IN')}</strong>`)}
        ${row('Payment', badge(order.paymentInfo?.status === 'paid' ? 'Paid ✓' : 'Pending', order.paymentInfo?.status === 'paid' ? '#dcfce7' : '#fef3c7', order.paymentInfo?.status === 'paid' ? '#16a34a' : '#d97706'))}
        ${row('Ship To', `${order.shippingAddress?.city}, ${order.shippingAddress?.state}`)}
      </table>
    </div>

    ${order.items?.map((item) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
        ${item.image ? `<img src="${item.image}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;"/>` : ''}
        <div style="flex:1;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${item.name}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')}</p>
        </div>
        <p style="margin:0;font-weight:700;color:#111827;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
      </div>
    `).join('')}

    <p style="color:#6b7280;font-size:12px;margin:16px 0 8px;">💡 Save your Order ID — you'll need it to write a product review after delivery.</p>
    <div style="text-align:center;">${btn('Track Your Order →', `${process.env.CLIENT_URL}/account/orders/${order._id}`)}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  9. NEW ORDER ALERT → vendor
// ════════════════════════════════════════════════════════
export const vendorNewOrderEmail = (vendorUser, order, items) => ({
  to: vendorUser.email,
  subject: `🛍️ New Order Received #${order._id.toString().slice(-8).toUpperCase()} — ShopWave`,
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">New Order! 🛍️</h2>
    <p style="color:#6b7280;margin:0 0 20px;">You have a new order. Please confirm and process it promptly.</p>

    <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:18px;margin:0 0 20px;">
      <table style="width:100%;">
        ${row('Order ID', order._id.toString().slice(-8).toUpperCase())}
        ${row('Customer', order.customer?.name || 'Customer')}
        ${row('Payment', badge('Paid ✓', '#dcfce7', '#16a34a'))}
        ${row('Date', new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }))}
      </table>
    </div>

    <p style="font-weight:700;color:#374151;margin:0 0 10px;font-size:14px;">Your items in this order:</p>
    ${items.map((item) => `
      <div style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${item.name}</p>
        <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">Qty: ${item.quantity} · ₹${(item.price * item.quantity).toLocaleString('en-IN')}</p>
      </div>
    `).join('')}

    <div style="text-align:center;margin-top:24px;">${btn('Manage Order →', `${process.env.CLIENT_URL}/vendor/orders`, '#6366f1')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  10. RETURN REQUESTED → customer confirmation
// ════════════════════════════════════════════════════════
export const returnRequestedEmail = (customer, order, returnRequest) => ({
  to: customer.email,
  subject: `↩️ Return Request Submitted — Order #${order._id.toString().slice(-8).toUpperCase()}`,
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Return Request Received ↩️</h2>
    <p style="color:#6b7280;margin:0 0 20px;line-height:1.6;">Hi <strong>${customer.name}</strong>, we've received your return request and our team will review it within <strong>24-48 hours</strong>.</p>

    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:18px;margin:0 0 20px;">
      <table style="width:100%;">
        ${row('Order ID', `<code style="font-size:13px;background:#fde68a;padding:2px 6px;border-radius:4px;">${order._id}</code>`)}
        ${row('Return Reason', returnRequest.reason.replace(/_/g, ' '))}
        ${row('Refund Amount', `<strong style="font-size:16px;color:#16a34a;">₹${returnRequest.refundAmount.toLocaleString('en-IN')}</strong>`)}
        ${row('Refund Method', 'Original Payment Method')}
        ${row('Status', badge('Under Review ⏳', '#fef3c7', '#d97706'))}
      </table>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#166534;font-size:13px;line-height:1.8;">
        <strong>What happens next?</strong><br/>
        ✅ Our team reviews your return request (24-48 hrs)<br/>
        ✅ Pickup will be scheduled at your delivery address<br/>
        ✅ Refund is processed within <strong>5-7 business days</strong> after item receipt
      </p>
    </div>

    <div style="text-align:center;">${btn('Track Return Status →', `${process.env.CLIENT_URL}/account/returns`, '#f59e0b')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  11. RETURN APPROVED → customer
// ════════════════════════════════════════════════════════
export const returnApprovedEmail = (customer, order, returnRequest) => ({
  to: customer.email,
  subject: `✅ Return Approved — Refund of ₹${returnRequest.refundAmount.toLocaleString('en-IN')} Initiated`,
  html: baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;line-height:1;">✅</div>
      <h2 style="color:#111827;margin:12px 0 6px;font-size:22px;">Return Approved!</h2>
      <p style="color:#6b7280;margin:0;">Your refund has been initiated successfully.</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin:0 0 20px;">
      <table style="width:100%;">
        ${row('Order ID', order._id.toString().slice(-8).toUpperCase())}
        ${row('Refund Amount', `<strong style="font-size:18px;color:#16a34a;">₹${returnRequest.refundAmount.toLocaleString('en-IN')}</strong>`)}
        ${row('Refund To', 'Original Payment Method (Razorpay)')}
        ${row('Expected By', '5-7 Business Days')}
        ${row('Status', badge('Refund Initiated ✓', '#dcfce7', '#16a34a'))}
      </table>
    </div>

    <div style="background:#eef2ff;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#4338ca;font-size:13px;line-height:1.8;">
        💳 <strong>About your refund:</strong><br/>
        The amount will be credited back to your original payment method.<br/>
        Credit Card: 5-7 business days · UPI: 1-2 business days · Net Banking: 3-5 business days
      </p>
    </div>

    <div style="text-align:center;">${btn('View Return Details →', `${process.env.CLIENT_URL}/account/returns`, '#16a34a')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  12. RETURN REJECTED → customer
// ════════════════════════════════════════════════════════
export const returnRejectedEmail = (customer, order, reason) => ({
  to: customer.email,
  subject: `Return Request Update — Order #${order._id.toString().slice(-8).toUpperCase()}`,
  html: baseTemplate(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Return Request Update</h2>
    <p style="color:#6b7280;margin:0 0 20px;">Hi <strong>${customer.name}</strong>, we've reviewed your return request for Order #${order._id.toString().slice(-8).toUpperCase()}.</p>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-weight:700;color:#dc2626;font-size:14px;">Request Not Approved</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;"><strong>Reason:</strong> ${reason || 'The return request did not meet our return policy criteria.'}</p>
    </div>

    <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-weight:600;color:#374151;font-size:14px;">Common reasons for rejection:</p>
      <ul style="margin:0;padding-left:18px;color:#6b7280;font-size:13px;line-height:2.2;">
        <li>Return request made after 7-day return window</li>
        <li>Product shows signs of use or damage by customer</li>
        <li>Missing original packaging or accessories</li>
        <li>Item is in a non-returnable category</li>
      </ul>
    </div>

    <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">If you believe this decision is incorrect, please contact our support team with your order details.</p>
    <div style="text-align:center;">${btn('Contact Support', `${process.env.CLIENT_URL}/account/returns`, '#6366f1')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  13. REFUND COMPLETED → customer
// ════════════════════════════════════════════════════════
export const refundCompletedEmail = (customer, order, refundAmount, refundId) => ({
  to: customer.email,
  subject: `💰 Refund of ₹${refundAmount.toLocaleString('en-IN')} Completed — ShopWave`,
  html: baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:52px;line-height:1;">💰</div>
      <h2 style="color:#111827;margin:12px 0 6px;font-size:24px;">Refund Successful!</h2>
      <p style="color:#6b7280;margin:0;">Your money is on its way back to you.</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 20px;text-align:center;">
      <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Amount Refunded</p>
      <p style="margin:0;font-size:36px;font-weight:900;color:#16a34a;">₹${refundAmount.toLocaleString('en-IN')}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Razorpay Refund ID: <code>${refundId || 'N/A'}</code></p>
    </div>

    <div style="background:#eef2ff;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#4338ca;font-size:13px;line-height:1.8;">
        ℹ️ The refund will appear in your account depending on your payment method:<br/>
        • <strong>Credit/Debit Card:</strong> 5-7 business days<br/>
        • <strong>UPI / Wallet:</strong> Within 24 hours<br/>
        • <strong>Net Banking:</strong> 3-5 business days
      </p>
    </div>

    <p style="color:#6b7280;font-size:13px;text-align:center;">Thank you for shopping with ShopWave. We're sorry for the inconvenience and hope to serve you again!</p>
    <div style="text-align:center;margin-top:16px;">${btn('Shop Again →', `${process.env.CLIENT_URL}/products`)}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  14. REPLACEMENT APPROVED → customer
// ════════════════════════════════════════════════════════
export const replacementApprovedEmail = (customer, order, returnRequest) => ({
  to: customer.email,
  subject: `🔄 Replacement Approved — Order #${order._id.toString().slice(-8).toUpperCase()} — ShopWave`,
  html: baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:52px;line-height:1;">🔄</div>
      <h2 style="color:#111827;margin:12px 0 6px;font-size:22px;">Replacement Approved!</h2>
      <p style="color:#6b7280;margin:0;">Your replacement item will be dispatched shortly.</p>
    </div>

    <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:18px;margin:0 0 20px;">
      <table style="width:100%;">
        ${row('Order ID', order._id.toString().slice(-8).toUpperCase())}
        ${row('Request Type', badge('Replacement 🔄', '#eef2ff', '#6366f1'))}
        ${row('Status', badge('Approved ✓', '#dcfce7', '#16a34a'))}
        ${row('Delivery', '3-5 business days after pickup')}
      </table>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#166534;font-size:13px;line-height:1.8;">
        <strong>What happens next:</strong><br/>
        ✅ Our pickup agent will collect the original item from your address<br/>
        ✅ The item will be inspected at our warehouse<br/>
        ✅ A brand new replacement will be dispatched within 3-5 business days
      </p>
    </div>

    <p style="color:#6b7280;font-size:13px;">Please keep the original item ready for pickup. No money is charged or refunded for replacements.</p>
    <div style="text-align:center;margin-top:16px;">${btn('Track Your Return →', `${process.env.CLIENT_URL}/account/returns`, '#6366f1')}</div>
  `),
});

// ════════════════════════════════════════════════════════
//  15. EXCHANGE APPROVED → customer
// ════════════════════════════════════════════════════════
export const exchangeApprovedEmail = (customer, order) => ({
  to: customer.email,
  subject: `🔃 Exchange Approved — Order #${order._id.toString().slice(-8).toUpperCase()} — ShopWave`,
  html: baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:52px;line-height:1;">🔃</div>
      <h2 style="color:#111827;margin:12px 0 6px;font-size:22px;">Exchange Approved!</h2>
      <p style="color:#6b7280;margin:0;">Our team will contact you to arrange the exchange.</p>
    </div>

    <div style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:12px;padding:18px;margin:0 0 20px;">
      <table style="width:100%;">
        ${row('Order ID', order._id.toString().slice(-8).toUpperCase())}
        ${row('Request Type', badge('Exchange 🔃', '#fdf4ff', '#7c3aed'))}
        ${row('Status', badge('Approved ✓', '#dcfce7', '#16a34a'))}
      </table>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#166534;font-size:13px;line-height:1.8;">
        <strong>What happens next:</strong><br/>
        ✅ Our team will contact you within 24 hours to confirm exchange details<br/>
        ✅ Choose your preferred size, color or variant<br/>
        ✅ Original item will be picked up and exchange dispatched
      </p>
    </div>

    <div style="text-align:center;">${btn('Track Your Return →', `${process.env.CLIENT_URL}/account/returns`, '#7c3aed')}</div>
  `),
});