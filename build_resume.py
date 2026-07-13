"""Builds a clean one-page resume PDF for Ahmed Ali, matching the portfolio's
blue accent + clean modern layout. Run: python3 build_resume.py
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_LEFT

INK = colors.HexColor("#14181F")
INK_SOFT = colors.HexColor("#5B6472")
ACCENT = colors.HexColor("#2F5FFF")
LINE = colors.HexColor("#E4E7EE")
VIBE = colors.HexColor("#7C3AED")

doc = SimpleDocTemplate(
    "assets/ahmed-ali-resume.pdf",
    pagesize=A4,
    leftMargin=20 * mm, rightMargin=20 * mm,
    topMargin=16 * mm, bottomMargin=16 * mm,
    title="Ahmed Ali - Resume",
    author="Ahmed Ali",
)

name_style = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=24,
                            textColor=ACCENT, leading=26, spaceAfter=2)
role_style = ParagraphStyle("role", fontName="Helvetica", fontSize=11.5,
                             textColor=INK_SOFT, leading=15, spaceAfter=4)
contact_style = ParagraphStyle("contact", fontName="Helvetica", fontSize=9,
                                textColor=INK_SOFT, leading=13)
section_style = ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=11.5,
                                textColor=INK, spaceBefore=14, spaceAfter=6,
                                tracking=0.5)
body_style = ParagraphStyle("body", fontName="Helvetica", fontSize=9.7,
                             textColor=INK_SOFT, leading=14, spaceAfter=6,
                             alignment=TA_LEFT)
job_title_style = ParagraphStyle("job", fontName="Helvetica-Bold", fontSize=10,
                                  textColor=INK, leading=14)
job_meta_style = ParagraphStyle("jobmeta", fontName="Helvetica-Oblique", fontSize=9,
                                 textColor=INK_SOFT, leading=13, spaceAfter=4)
bullet_style = ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.5,
                               textColor=INK_SOFT, leading=13.5, leftIndent=10,
                               spaceAfter=3)
proj_title_style = ParagraphStyle("projtitle", fontName="Helvetica-Bold", fontSize=9.8,
                                   textColor=INK, leading=13)
proj_url_style = ParagraphStyle("projurl", fontName="Helvetica", fontSize=8.7,
                                 textColor=ACCENT, leading=12, spaceAfter=1)
proj_desc_style = ParagraphStyle("projdesc", fontName="Helvetica", fontSize=9.3,
                                  textColor=INK_SOFT, leading=13, spaceAfter=7)
skill_label_style = ParagraphStyle("skilllabel", fontName="Helvetica-Bold", fontSize=9.3,
                                    textColor=INK, leading=13)
skill_val_style = ParagraphStyle("skillval", fontName="Helvetica", fontSize=9.3,
                                  textColor=INK_SOFT, leading=13)

def rule():
    return HRFlowable(width="100%", thickness=0.8, color=LINE, spaceBefore=2, spaceAfter=0)

story = []

story.append(Paragraph("AHMED ALI", name_style))
story.append(Paragraph("Frontend Developer &nbsp;&middot;&nbsp; Webflow Expert &nbsp;&middot;&nbsp; SEO Specialist &nbsp;&middot;&nbsp; Vibe Coder", role_style))
story.append(Paragraph(
    "ahmed.ali@email.com &nbsp;|&nbsp; ahmedali.dev &nbsp;|&nbsp; github.com/ahmedali &nbsp;|&nbsp; "
    "linkedin.com/in/ahmedali &nbsp;|&nbsp; Pakistan",
    contact_style))
story.append(Spacer(1, 8))
story.append(rule())

story.append(Paragraph("SUMMARY", section_style))
story.append(Paragraph(
    "Frontend developer who builds fast, search-optimized websites four ways &mdash; hand-written "
    "code, Webflow, SEO-first strategy, and AI-assisted (&ldquo;vibe coding&rdquo;) workflows. "
    "Comfortable owning a project from a Figma file, or just a prompt, through to a live site "
    "that actually ranks.", body_style))

story.append(Paragraph("SKILLS", section_style))
skills_data = [
    [Paragraph("Frontend", skill_label_style), Paragraph("HTML5, CSS3, JavaScript, React", skill_val_style)],
    [Paragraph("Webflow", skill_label_style), Paragraph("Webflow CMS, Custom Interactions, Client Handoff", skill_val_style)],
    [Paragraph("SEO", skill_label_style), Paragraph("Technical SEO, On-Page SEO, Core Web Vitals, Keyword Research", skill_val_style)],
    [Paragraph("Vibe Coding", skill_label_style), Paragraph("Claude, Cursor, Rapid Prototyping", skill_val_style)],
]
skills_table = Table(skills_data, colWidths=[28 * mm, 142 * mm])
skills_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 2),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
]))
story.append(skills_table)
story.append(Spacer(1, 4))

story.append(Paragraph("EXPERIENCE", section_style))
story.append(Paragraph("Freelance Frontend Developer &amp; Webflow Specialist", job_title_style))
story.append(Paragraph("Self-employed &nbsp;&middot;&nbsp; Pakistan &nbsp;&middot;&nbsp; Present", job_meta_style))
for b in [
    "Design and build responsive websites in hand-written code and Webflow for small businesses and personal brands",
    "Run technical and on-page SEO passes so client sites are positioned to rank, not just launch",
    "Increasingly use AI-assisted development workflows (Claude, Cursor) to prototype and ship faster",
]:
    story.append(Paragraph(f"&bull;&nbsp; {b}", bullet_style))

story.append(Paragraph("SELECTED PROJECTS", section_style))
projects = [
    ("DevicesArena", "devicesarena.com",
     "Full-stack smartphone review and comparison platform &mdash; device database, spec-by-spec "
     "compare tool, custom auth, live news section. Hand-coded end to end."),
    ("Muse AI", "muse-ai-ahmed.webflow.io",
     "AI SaaS landing page built entirely in Webflow &mdash; animated stat counters, pricing tables, "
     "full marketing-site structure."),
    ("Umrah Tours", "umrah-tours.webflow.io",
     "Travel-agency site for Umrah packages &mdash; Webflow build plus on-page SEO groundwork "
     "across every page."),
    ("Exam Portal", "exam-portal.infinityfreeapp.com",
     "Full-stack exam portal with student login and a live leaderboard served through its own "
     "PHP API. Vibe-coded with AI-assisted tools."),
]
for title, url, desc in projects:
    story.append(Paragraph(title, proj_title_style))
    story.append(Paragraph(url, proj_url_style))
    story.append(Paragraph(desc, proj_desc_style))

story.append(Paragraph("EDUCATION", section_style))
story.append(Paragraph("[Add your degree and institution here]", body_style))

story.append(Paragraph("TOOLS", section_style))
story.append(Paragraph(
    "Figma, Webflow, VS Code, Claude, Cursor, Git &amp; GitHub, Google Search Console, Ahrefs, Google Analytics",
    body_style))

doc.build(story)
print("Resume PDF built.")
