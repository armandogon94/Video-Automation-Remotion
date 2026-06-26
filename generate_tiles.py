import json
import os
import subprocess

os.makedirs('/tmp/gemini-audit', exist_ok=True)
data = json.load(open('parsed_data.json'))

def get_duration(vid_path):
    try:
        res = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', vid_path])
        return float(res.decode().strip())
    except:
        return 10.0

def make_tile(vid_path, out_path, num_frames=6):
    dur = get_duration(vid_path)
    interval = max(dur / (num_frames + 1), 0.2)
    # Extract frames using fps filter to get exact number of frames evenly spaced
    cmd = [
        'ffmpeg', '-y', '-i', vid_path,
        '-vf', f'fps=1/{interval},scale=-1:290,tile={num_frames}x1',
        '-frames:v', '1', out_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Cross Creator
cross_html = ""
for i, row in enumerate(data['cross']):
    comp_id = row['comp_id']
    vid = row['render_vid']
    if not vid: continue
    
    vid_path = os.path.join('/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b', vid)
    out_tile = f'/tmp/gemini-audit/cross_{i:02d}_{comp_id}_render.jpg'
    
    if os.path.exists(vid_path):
        make_tile(vid_path, out_tile, 6)
        
    cross_html += f"<h3>{comp_id}</h3>\n"
    # Source frames are already in the directory, let's just list them
    src_dir = f'output/cross-creator/srcframes/'
    src_imgs = [f for f in os.listdir(src_dir) if f.startswith(comp_id + '__')] if os.path.exists(src_dir) else []
    src_imgs.sort()
    for img in src_imgs:
        cross_html += f"<img src='/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b/{src_dir}{img}' height='290'>\n"
    cross_html += "<br>\n"
    if os.path.exists(out_tile):
        cross_html += f"<img src='{out_tile}' height='290'>\n"
    cross_html += "<hr>\n"

# Abhi
abhi_html = ""
for i, row in enumerate(data['abhi']):
    comp_id = row['comp_id']
    src_vid = row['source_vid']
    ren_vid = row['render_vid']
    if not ren_vid or not src_vid: continue
    
    src_path = os.path.join('/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b', src_vid)
    ren_path = os.path.join('/Users/armandogonzalez/Downloads/Claude/Deep Research Claude Code/10-Video-Automation-Remotion/.claude/worktrees/recursing-tu-dac74b', ren_vid)
    
    src_tile = f'/tmp/gemini-audit/abhi_{i:02d}_{comp_id}_source.jpg'
    ren_tile = f'/tmp/gemini-audit/abhi_{i:02d}_{comp_id}_render.jpg'
    
    if os.path.exists(src_path):
        make_tile(src_path, src_tile, 6)
    if os.path.exists(ren_path):
        make_tile(ren_path, ren_tile, 6)
        
    abhi_html += f"<h3>{comp_id}</h3>\n"
    if os.path.exists(src_tile):
        abhi_html += f"<img src='{src_tile}' height='290'><br>\n"
    if os.path.exists(ren_tile):
        abhi_html += f"<img src='{ren_tile}' height='290'>\n"
    abhi_html += "<hr>\n"

with open('/tmp/gemini-audit/summary.html', 'w') as f:
    f.write(f"<html><body><h1>Cross Creator</h1>{cross_html}<h1>Abhi</h1>{abhi_html}</body></html>")
