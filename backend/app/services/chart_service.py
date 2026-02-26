import matplotlib
matplotlib.use('Agg') # Use the 'Agg' backend for non-GUI servers (Crucial for web apps)
import matplotlib.pyplot as plt
import io
import base64

def generate_attendance_pie_chart(attended: int, total: int) -> str:
    """
    Generates a Pie Chart (Present vs Absent) with a Legend and returns a Base64 image string.
    """
    # 1. Calculate Data
    # Ensure we don't have negative numbers if attended > total (extra credit case)
    absent = max(0, total - attended)
    
    # Handle edge case: if total is 0, avoid error
    if total == 0:
        sizes = [0, 1] # Full gray circle
        labels = ['No Classes', '']
    else:
        sizes = [attended, absent]
        labels = ['Attended', 'Missed']
        
    colors = ['#4F46E5', '#E5E7EB'] # Indigo (Brand) vs Gray
    
    # 2. Create Plot (Object-Oriented approach)
    # Increased width (6, 3) to make room for the legend on the right
    fig, ax = plt.subplots(figsize=(6, 3)) 
    
    # Function to show percentage only if slice is big enough
    def autopct_filter(pct):
        return ('%1.1f%%' % pct) if pct > 0 else ''

    wedges, texts, autotexts = ax.pie(
        sizes, 
        # labels=labels, # REMOVED labels from the slices themselves to keep it clean
        autopct=autopct_filter, 
        colors=colors, 
        startangle=90, 
        textprops={'fontsize': 9, 'color': 'white' if attended > absent else '#333'},
        wedgeprops={'edgecolor': 'white', 'linewidth': 1} # Add white separators
    )
    
    ax.axis('equal') # Equal aspect ratio ensures that pie is drawn as a circle.

    # --- ADD LEGEND ---
    # bbox_to_anchor moves the legend outside the chart to the right
    ax.legend(
        wedges, 
        labels, 
        title="Status", 
        loc="center left", 
        bbox_to_anchor=(1, 0, 0.5, 1),
        frameon=False # Remove the box border around the legend for a cleaner look
    )

    # 3. Save to Memory Buffer
    buf = io.BytesIO()
    # bbox_inches='tight' ensures the legend isn't cut off when saving
    plt.savefig(buf, format='png', bbox_inches='tight', transparent=True, dpi=100)
    plt.close(fig) # Close memory to prevent leaks
    buf.seek(0)

    # 4. Convert to Base64 String
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return image_base64