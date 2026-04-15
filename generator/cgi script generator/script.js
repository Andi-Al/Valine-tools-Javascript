// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// Debounce & Throttle
// ========================================
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ========================================
// String Utilities
// ========================================
function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
    });
    return el;
}

// ========================================
// Storage Helpers (localStorage)
// ========================================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch { return false; }
    },
    remove(key) { localStorage.removeItem(key); },
    clear() { localStorage.clear(); }
};

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
        return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
}

// ========================================
// CGI Script Generator Logic
// ========================================
let fieldCounter = 3;

function getFields() {
    const rows = $$('.field-row');
    const fields = [];
    rows.forEach(row => {
        const name = row.querySelector('.field-name').value.trim();
        const type = row.querySelector('.field-type').value;
        const required = row.querySelector('.field-required').checked;
        if (name) fields.push({ name, type, required });
    });
    return fields;
}

function generatePythonCGI(fields, method, formAction, successUrl, errorUrl) {
    let script = `#!/usr/bin/env python3
import cgi
import cgitb
import os
import sys

cgitb.enable()

# Configuration
SUCCESS_URL = "${successUrl}"
ERROR_URL = "${errorUrl}"
ALLOWED_METHOD = "${method.toUpperCase()}"

def sanitize_html(text):
    """Escape HTML special characters to prevent XSS."""
    if text is None:
        return ""
    text = str(text)
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    text = text.replace('"', "&quot;")
    text = text.replace("'", "&#x27;")
    return text

def validate_email(email):
    """Basic email validation."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def main():
    # Check request method
    if os.environ.get("REQUEST_METHOD") != ALLOWED_METHOD:
        print("Status: 405 Method Not Allowed")
        print("Content-Type: text/html\\n")
        print("<h1>405 Method Not Allowed</h1>")
        return

    ${method === 'GET' ? `# Parse GET parameters from QUERY_STRING
    form = cgi.FieldStorage()
` : `# Read POST data
    content_length = int(os.environ.get("CONTENT_LENGTH", 0))
    form = cgi.FieldStorage()
`}
    # Extract and validate form data
    data = {}
    errors = []

`;

    fields.forEach(field => {
        const varName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
        script += `    # ${field.name} (${field.type}${field.required ? ', required' : ''})
    ${varName} = form.getvalue("${field.name}", "")
`;
        if (field.required) {
            script += `    if not ${varName}:
        errors.append("${field.name} is required")
`;
        }
        if (field.type === 'email') {
            script += `    if ${varName} and not validate_email(${varName}):
        errors.append("Invalid email format for ${field.name}")
`;
        }
        if (field.type === 'number') {
            script += `    if ${varName}:
        try:
            ${varName} = float(${varName})
        except ValueError:
            errors.append("${field.name} must be a number")
`;
        }
        script += `    data["${field.name}"] = sanitize_html(str(${varName}))

`;
    });

    script += `    # Process data
    if errors:
        print("Content-Type: text/html\\n")
        print("<!DOCTYPE html>")
        print("<html><head><title>Error</title></head><body>")
        print("<h1>Form Validation Errors</h1>")
        print("<ul>")
        for error in errors:
            print(f"<li>{error}</li>")
        print("</ul>")
        print(f'<p><a href="{ERROR_URL}">Go back</a></p>')
        print("</body></html>")
    else:
        print("Content-Type: text/html\\n")
        print("<!DOCTYPE html>")
        print("<html><head><title>Success</title></head><body>")
        print("<h1>Form Submitted Successfully</h1>")
        print("<h2>Received Data:</h2>")
        print("<table border='1'><tr><th>Field</th><th>Value</th></tr>")
        for key, value in data.items():
            print(f"<tr><td>{key}</td><td>{value}</td></tr>")
        print("</table>")
        print(f'<p><a href="{SUCCESS_URL}">Continue</a></p>')
        print("</body></html>")

if __name__ == "__main__":
    main()
`;
    return script;
}

function generatePerlCGI(fields, method, formAction, successUrl, errorUrl) {
    let script = `#!/usr/bin/env perl
use strict;
use warnings;
use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use URI::Escape;

# Configuration
my \\$SUCCESS_URL = "${successUrl}";
my \\$ERROR_URL = "${errorUrl}";
my \\$ALLOWED_METHOD = "${method.toUpperCase()}";

sub sanitize_html {
    my (\\$text) = @_;
    return "" unless defined \\$text;
    \\$text =~ s/&/&amp;/g;
    \\$text =~ s/</&lt;/g;
    \\$text =~ s/>/&gt;/g;
    \\$text =~ s/"/&quot;/g;
    \\$text =~ s/'/&#x27;/g;
    return \\$text;
}

sub validate_email {
    my (\\$email) = @_;
    return \\$email =~ /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
}

my \\$cgi = CGI->new;
my \\$request_method = $ENV{'REQUEST_METHOD'} || '';

# Check request method
if (\\$request_method ne \\$ALLOWED_METHOD) {
    print header(-status => '405 Method Not Allowed', -type => 'text/html');
    print "<h1>405 Method Not Allowed</h1>";
    exit;
}

`;

    if (method === 'GET') {
        script += `# Parse GET parameters
`;
    }

    script += `
# Extract and validate form data
my %data;
my @errors;

`;

    fields.forEach(field => {
        const varName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
        script += `# ${field.name} (${field.type}${field.required ? ', required' : ''})
my \\$${varName} = \\$cgi->param("${field.name}") || "";
`;
        if (field.required) {
            script += `push @errors, "${field.name} is required" unless \\$${varName};
`;
        }
        if (field.type === 'email') {
            script += `push @errors, "Invalid email format for ${field.name}" if \\$${varName} && !validate_email(\\$${varName});
`;
        }
        if (field.type === 'number') {
            script += `if (\\$${varName}) {
    unless (\\$${varName} =~ /^-?\\d+(\\.\\d+)?$/) {
        push @errors, "${field.name} must be a number";
    }
}
`;
        }
        script += `\\$data{"${field.name}"} = sanitize_html(\\$${varName});

`;
    });

    script += `
# Output
if (@errors) {
    print header(-type => 'text/html');
    print "<!DOCTYPE html><html><head><title>Error</title></head><body>";
    print "<h1>Form Validation Errors</h1><ul>";
    foreach my \\$error (@errors) {
        print "<li>\\$error</li>";
    }
    print "</ul><p><a href='\\$ERROR_URL'>Go back</a></p>";
    print "</body></html>";
} else {
    print header(-type => 'text/html');
    print "<!DOCTYPE html><html><head><title>Success</title></head><body>";
    print "<h1>Form Submitted Successfully</h1>";
    print "<h2>Received Data:</h2>";
    print "<table border='1'><tr><th>Field</th><th>Value</th></tr>";
    foreach my \\$key (keys %data) {
        print "<tr><td>\\$key</td><td>\\$data{\\$key}</td></tr>";
    }
    print "</table>";
    print "<p><a href='\\$SUCCESS_URL'>Continue</a></p>";
    print "</body></html>";
}
`;
    return script;
}

function generateBashCGI(fields, method, formAction, successUrl, errorUrl) {
    const q = '"';
    const bs = '\\';
    let script = '#!/bin/bash\n';
    script += '# CGI Script Generator - Bash\n';
    script += '# Configuration\n';
    script += 'SUCCESS_URL=' + q + successUrl + q + '\n';
    script += 'ERROR_URL=' + q + errorUrl + q + '\n';
    script += 'ALLOWED_METHOD=' + q + method.toUpperCase() + q + '\n\n';
    script += '# HTML escape function\n';
    script += 'escape_html() {\n';
    script += '    local text=' + q + '$1' + q + '\n';
    script += '    text=' + q + '$' + q + '{text//&/&amp;}' + q + '\n';
    script += '    text=' + q + '$' + q + '{text//</&lt;}' + q + '\n';
    script += '    text=' + q + '$' + q + '{text//>/&gt;}' + q + '\n';
    script += '    text=' + q + '$' + q + '{text//' + bs + '"' + bs + '/&quot;}' + q + '\n';
    script += '    text=' + q + '$' + q + "{text//" + bs + "'/" + bs + '&#x27;}' + q + '\n';
    script += '    echo ' + q + '$text' + q + '\n';
    script += '}\n\n';
    script += '# Check request method\n';
    script += 'if [ ' + q + bs + '$REQUEST_METHOD' + q + ' != ' + q + bs + '$ALLOWED_METHOD' + q + ' ]; then\n';
    script += '    echo ' + q + 'Status: 405 Method Not Allowed' + q + '\n';
    script += '    echo ' + q + 'Content-Type: text/html' + q + '\n';
    script += '    echo ' + q + q + '\n';
    script += '    echo ' + q + '<h1>405 Method Not Allowed</h1>' + q + '\n';
    script += '    exit 1\n';
    script += 'fi\n\n';

    if (method === 'GET') {
        script += '# Parse QUERY_STRING for GET\n';
        script += 'QUERY_DATA=' + q + bs + '$QUERY_STRING' + q + '\n';
    } else {
        script += '# Read POST data from stdin\n';
        script += 'CONTENT_LENGTH=' + q + bs + '${CONTENT_LENGTH:-0}' + q + '\n';
        script += 'if [ ' + q + bs + '$CONTENT_LENGTH' + q + ' -gt 0 ]; then\n';
        script += '    POST_DATA=$(dd bs=1 count=' + bs + '$CONTENT_LENGTH 2>/dev/null)\n';
        script += 'else\n';
        script += '    POST_DATA=' + q + q + '\n';
        script += 'fi\n';
        script += 'DATA=' + q + bs + '${POST_DATA:-' + bs + '$QUERY_DATA}' + q + '\n';
    }

    script += '\n# URL decode function\n';
    script += 'url_decode() {\n';
    script += '    local encoded=' + q + '$1' + q + '\n';
    script += '    local decoded\n';
    script += '    decoded=$(printf ' + q + "'%b'" + q + ' ' + q + bs + bs + '${encoded//%/' + bs + bs + bs + bs + 'x}' + q + ')\n';
    script += '    decoded=' + q + bs + '${decoded//+/ }' + q + '\n';
    script += '    echo ' + q + '$decoded' + q + '\n';
    script += '}\n\n';
    script += '# Extract field value\n';
    script += 'get_field() {\n';
    script += '    local field_name=' + q + '$1' + q + '\n';
    script += '    local data=' + q + bs + '${DATA:-}' + q + '\n';
    script += '    local value\n';
    script += "    value=$(echo " + q + '$data' + q + " | grep -oP " + q + "'(?<=(^|&)" + q + '+field_name+' + q + '=)[^&]*' + q + " | head -1)\n";
    script += '    url_decode ' + q + '$value' + q + '\n';
    script += '}\n\n';
    script += '# Validation\n';
    script += 'ERRORS=' + q + q + '\n\n';

    fields.forEach(field => {
        const varName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
        script += '# ' + field.name + '\n';
        script += varName + '$(get_field ' + q + field.name + q + ')\n';
        if (field.required) {
            script += 'if [ -z ' + q + bs + '$' + varName + q + ' ]; then\n';
            script += '    ERRORS=' + q + bs + '${ERRORS}<li>' + field.name + ' is required</li>' + q + '\n';
            script += 'fi\n';
        }
        if (field.type === 'email') {
            script += 'if [ -n ' + q + bs + '$' + varName + q + ' ]; then\n';
            script += '    if ! echo ' + q + bs + '$' + varName + q + " | grep -qP " + q + "'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+" + bs + ".[a-zA-Z]{2,}$'" + q + "; then\n";
            script += '        ERRORS=' + q + bs + '${ERRORS}<li>Invalid email format for ' + field.name + '</li>' + q + '\n';
            script += '    fi\n';
            script += 'fi\n';
        }
        script += '\n';
    });

    script += '\n# Output\n';
    script += 'if [ -n ' + q + bs + '$ERRORS' + q + ' ]; then\n';
    script += '    echo ' + q + 'Content-Type: text/html' + q + '\n';
    script += '    echo ' + q + q + '\n';
    script += '    echo ' + q + '<!DOCTYPE html>' + q + '\n';
    script += '    echo ' + q + '<html><head><title>Error</title></head><body>' + q + '\n';
    script += '    echo ' + q + '<h1>Form Validation Errors</h1>' + q + '\n';
    script += '    echo ' + q + '<ul>' + bs + '$ERRORS</ul>' + q + '\n';
    script += "    echo " + q + "<p><a href='" + bs + "$ERROR_URL'>Go back</a></p>" + q + '\n';
    script += '    echo ' + q + '</body></html>' + q + '\n';
    script += 'else\n';
    script += '    echo ' + q + 'Content-Type: text/html' + q + '\n';
    script += '    echo ' + q + q + '\n';
    script += '    echo ' + q + '<!DOCTYPE html>' + q + '\n';
    script += '    echo ' + q + '<html><head><title>Success</title></head><body>' + q + '\n';
    script += '    echo ' + q + '<h1>Form Submitted Successfully</h1>' + q + '\n';
    script += '    echo ' + q + '<h2>Received Data:</h2>' + q + '\n';
    script += "    echo " + q + "<table border='1'><tr><th>Field</th><th>Value</th></tr>" + q + '\n';

    fields.forEach(field => {
        const varName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
        script += '    echo ' + q + '<tr><td>' + field.name + '</td><td>$(escape_html ' + q + bs + '$' + varName + q + ')</td></tr>' + q + '\n';
    });

    script += "    echo " + q + "</table>" + q + '\n';
    script += "    echo " + q + "<p><a href='" + bs + "$SUCCESS_URL'>Continue</a></p>" + q + '\n';
    script += '    echo ' + q + '</body></html>' + q + '\n';
    script += 'fi\n';
    return script;
}

function generatePHPCGI(fields, method, formAction, successUrl, errorUrl) {
    let script = `<?php
/**
 * CGI Script Generator - PHP
 * Note: PHP runs as CGI or module, this script handles form processing
 */

// Configuration
\\$SUCCESS_URL = "${successUrl}";
\\$ERROR_URL = "${errorUrl}";
\\$ALLOWED_METHOD = "${method.toUpperCase()}";

/**
 * Sanitize HTML output to prevent XSS
 */
function sanitize_html(\\$text) {
    if (\\$text === null) return "";
    return htmlspecialchars((string)\\$text, ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email format
 */
function validate_email(\\$email) {
    return filter_var(\\$email, FILTER_VALIDATE_EMAIL) !== false;
}

// Check request method
if (\\$_SERVER['REQUEST_METHOD'] !== \\$ALLOWED_METHOD) {
    http_response_code(405);
    header('Content-Type: text/html');
    echo "<h1>405 Method Not Allowed</h1>";
    exit;
}

// Extract form data
\\$errors = [];
\\$data = [];

`;

    fields.forEach(field => {
        const varName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
        const methodVar = method === 'GET' ? `$_GET` : `$_POST`;
        script += `// ${field.name} (${field.type}${field.required ? ', required' : ''})
\\$${varName} = ${methodVar}['${field.name}'] ?? '';

`;
        if (field.required) {
            script += `if (empty(\\$${varName})) {
    \\$errors[] = "${field.name} is required";
}

`;
        }
        if (field.type === 'email') {
            script += `if (!empty(\\$${varName}) && !validate_email(\\$${varName})) {
    \\$errors[] = "Invalid email format for ${field.name}";
}

`;
        }
        if (field.type === 'number') {
            script += `if (!empty(\\$${varName}) && !is_numeric(\\$${varName})) {
    \\$errors[] = "${field.name} must be a number";
}

`;
        }
        script += `\\$data["${field.name}"] = sanitize_html(\\$${varName});

`;
    });

    script += `
// Output
if (!empty(\\$errors)) {
    header('Content-Type: text/html');
    echo "<!DOCTYPE html>";
    echo "<html><head><title>Error</title></head><body>";
    echo "<h1>Form Validation Errors</h1>";
    echo "<ul>";
    foreach (\\$errors as \\$error) {
        echo "<li>" . sanitize_html(\\$error) . "</li>";
    }
    echo "</ul>";
    echo '<p><a href="' . sanitize_html(\\$ERROR_URL) . '">Go back</a></p>';
    echo "</body></html>";
} else {
    header('Content-Type: text/html');
    echo "<!DOCTYPE html>";
    echo "<html><head><title>Success</title></head><body>";
    echo "<h1>Form Submitted Successfully</h1>";
    echo "<h2>Received Data:</h2>";
    echo "<table border='1'><tr><th>Field</th><th>Value</th></tr>";
    foreach (\\$data as \\$key => \\$value) {
        echo "<tr><td>" . sanitize_html(\\$key) . "</td><td>" . sanitize_html(\\$value) . "</td></tr>";
    }
    echo "</table>";
    echo '<p><a href="' . sanitize_html(\\$SUCCESS_URL) . '">Continue</a></p>';
    echo "</body></html>";
}
?>
`;
    return script;
}

function generateHTMLForm(fields, method, formAction) {
    let form = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; font-weight: bold; margin-bottom: 0.25rem; }
        input, select, textarea { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
        button { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; }
        button:hover { background: #1d4ed8; }
        .required::after { content: " *"; color: red; }
    </style>
</head>
<body>
    <h1>Submit Form</h1>
    <form action="${formAction}" method="${method.toLowerCase()}">
`;

    fields.forEach(field => {
        const isRequired = field.required ? ' required' : '';
        const requiredClass = field.required ? ' class="required"' : '';

        if (field.type === 'textarea') {
            form += `        <div class="form-group">
            <label for="${field.name}"${requiredClass}>${field.name}</label>
            <textarea id="${field.name}" name="${field.name}" rows="4"${isRequired}></textarea>
        </div>
`;
        } else if (field.type === 'select') {
            form += `        <div class="form-group">
            <label for="${field.name}"${requiredClass}>${field.name}</label>
            <select id="${field.name}" name="${field.name}"${isRequired}>
                <option value="">-- Select --</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
            </select>
        </div>
`;
        } else if (field.type === 'checkbox') {
            form += `        <div class="form-group">
            <label>
                <input type="checkbox" name="${field.name}" value="1"${isRequired}> ${field.name}
            </label>
        </div>
`;
        } else if (field.type === 'email') {
            form += `        <div class="form-group">
            <label for="${field.name}"${requiredClass}>${field.name}</label>
            <input type="email" id="${field.name}" name="${field.name}"${isRequired}>
        </div>
`;
        } else if (field.type === 'number') {
            form += `        <div class="form-group">
            <label for="${field.name}"${requiredClass}>${field.name}</label>
            <input type="number" id="${field.name}" name="${field.name}"${isRequired}>
        </div>
`;
        } else {
            form += `        <div class="form-group">
            <label for="${field.name}"${requiredClass}>${field.name}</label>
            <input type="text" id="${field.name}" name="${field.name}"${isRequired}>
        </div>
`;
        }
    });

    form += `        <div class="form-group">
            <button type="submit">Submit</button>
        </div>
    </form>
</body>
</html>`;
    return form;
}

function generate() {
    const fields = getFields();
    if (fields.length === 0) {
        showToast('Please add at least one form field');
        return;
    }

    const lang = $('#script-lang').value;
    const method = $('input[name="method"]:checked').value;
    const formAction = $('#form-action').value.trim() || '/cgi-bin/process.cgi';
    const successUrl = $('#success-url').value.trim() || '/success.html';
    const errorUrl = $('#error-url').value.trim() || '/error.html';

    let cgiScript = '';
    switch (lang) {
        case 'python':
            cgiScript = generatePythonCGI(fields, method, formAction, successUrl, errorUrl);
            break;
        case 'perl':
            cgiScript = generatePerlCGI(fields, method, formAction, successUrl, errorUrl);
            break;
        case 'bash':
            cgiScript = generateBashCGI(fields, method, formAction, successUrl, errorUrl);
            break;
        case 'php':
            cgiScript = generatePHPCGI(fields, method, formAction, successUrl, errorUrl);
            break;
    }

    const htmlForm = generateHTMLForm(fields, method, formAction);

    $('#output-cgi').textContent = cgiScript;
    $('#output-form').textContent = htmlForm;

    showToast('CGI script generated!');
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CGI Script Generator', icon: '🖥️' });

    // Generate button
    $('#generate-btn').addEventListener('click', generate);

    // Add field button
    $('#add-field-btn').addEventListener('click', () => {
        fieldCounter++;
        const row = createElement('div', {
            className: 'field-row',
            'data-index': fieldCounter
        });
        row.innerHTML = `
            <input type="text" class="form-input field-name" placeholder="Field name" value="field_${fieldCounter}">
            <select class="form-select field-type">
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
            </select>
            <label class="checkbox-inline">
                <input type="checkbox" class="field-required"> Required
            </label>
            <button class="btn-remove-field" title="Remove">&times;</button>
        `;
        $('#fields-container').appendChild(row);

        row.querySelector('.btn-remove-field').addEventListener('click', () => {
            row.remove();
        });
    });

    // Remove field listeners
    $$('.btn-remove-field').forEach(btn => {
        btn.addEventListener('click', () => {
            if ($$('.field-row').length > 1) {
                btn.closest('.field-row').remove();
            } else {
                showToast('Minimum 1 field required');
            }
        });
    });

    // Tab switching
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            $(`#output-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Copy code button
    $('#copy-code-btn').addEventListener('click', () => {
        const activeTab = $('.tab-btn.active').dataset.tab;
        const code = $(`#output-${activeTab}`).textContent;
        if (code) {
            copyToClipboard(code);
        }
    });

    // Download button
    $('#download-btn').addEventListener('click', () => {
        const lang = $('#script-lang').value;
        const cgiCode = $('#output-cgi').textContent;
        if (!cgiCode) {
            showToast('Generate code first');
            return;
        }

        const extensions = { python: '.py', perl: '.pl', bash: '.sh', php: '.php' };
        const ext = extensions[lang] || '.txt';
        const blob = new Blob([cgiCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `process${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Script downloaded!');
    });

    // Auto-generate on input change (debounced)
    const debouncedGenerate = debounce(generate, 300);
    $$('#tool-content input, #tool-content select, #tool-content textarea').forEach(el => {
        el.addEventListener('input', debouncedGenerate);
        el.addEventListener('change', debouncedGenerate);
    });

    // Initial generate
    generate();
});
