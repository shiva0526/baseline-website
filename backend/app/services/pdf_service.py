import pdfkit
import os
import platform
from fastapi.templating import Jinja2Templates

# 1. Setup Template Directory
# This finds the folder relative to this file
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)

def generate_report_pdf(data: dict) -> bytes:
    """
    1. Takes a dictionary of data.
    2. Injects it into report.html.
    3. Renders a PDF binary using pdfkit (wkhtmltopdf).
    """
    # 'request': None is required by Jinja2Templates
    data["request"] = None 
    
    # 1. Render HTML
    template = templates.get_template("report.html")
    rendered_html = template.render(data)
    
    # 2. Configure wkhtmltopdf
    # pdfkit needs to know exactly where the .exe is located on Windows.
    path_to_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'

    # Check if the file exists at the default location
    if platform.system() == "Windows" and os.path.exists(path_to_wkhtmltopdf):
        config = pdfkit.configuration(wkhtmltopdf=path_to_wkhtmltopdf)
    else:
        # If not on Windows or file not found, assume it's in the System PATH
        # (This works for Linux/Mac/Docker deployments)
        config = None

    # 3. Options to make the PDF look better
    options = {
        'page-size': 'A4',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': "UTF-8",
        'no-outline': None
    }

    # 4. Convert to PDF
    # passing False as the output path makes it return bytes
    try:
        pdf_bytes = pdfkit.from_string(
            rendered_html, 
            False, 
            configuration=config, 
            options=options
        )
        return pdf_bytes
        
    except OSError as e:
        # Friendly error message if the tool isn't found
        if "No wkhtmltopdf executable found" in str(e):
            raise RuntimeError(
                "wkhtmltopdf is not found! Please install it from https://wkhtmltopdf.org/downloads.html "
                "and ensure it is at C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe"
            )
        raise e