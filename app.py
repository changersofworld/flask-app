from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from flask import send_from_directory

app = Flask(__name__, static_url_path='/static')
app.static_folder = 'C:\\Users\\prince\\Project\\static'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:9971446355@localhost/my_app'
db = SQLAlchemy(app)
# Define models
class VideoLink(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    link = db.Column(db.String(255), nullable=False)

class StudyPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date)

class TimeManagement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

class WeeklyReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    week_start = db.Column(db.Date, nullable=False)
    week_end = db.Column(db.Date, nullable=False)
    content = db.Column(db.Text, nullable=False)

# Create database tables
with app.app_context():
    db.create_all()
    


@app.after_request
def add_header(response):
    response.cache_control.no_cache = True
    response.cache_control.no_store = True
    response.cache_control.must_revalidate = True
    response.headers['Expires'] = '0'
    response.headers['Pragma'] = 'no-cache'
    return response

# Routes for video links
@app.route('/video_links', methods=['GET'])
def get_video_links():
    video_links = VideoLink.query.all()
    return jsonify([{'id': link.id, 'title': link.title, 'link': link.link} for link in video_links])

@app.route('/video_links', methods=['POST'])
def add_video_link():
    data = request.json
    new_link = VideoLink(title=data['title'], link=data['link'])
    db.session.add(new_link)
    db.session.commit()
    return jsonify({'message': 'Video link added successfully'})

@app.route('/video_links/<int:id>', methods=['PUT'])
def edit_video_link(id):
    data = request.json
    link = VideoLink.query.get(id)
    link.title = data['title']
    link.link = data['link']
    db.session.commit()
    return jsonify({'message': 'Video link updated successfully'})

@app.route('/video_links/<int:id>', methods=['DELETE'])
def delete_video_link(id):
    link = VideoLink.query.get(id)
    db.session.delete(link)
    db.session.commit()
    return jsonify({'message': 'Video link deleted successfully'})

# Routes for study plans
@app.route('/study_plans', methods=['GET'])
def get_study_plans():
    study_plans = StudyPlan.query.all()
    return jsonify([{
        'id': plan.id,
        'title': plan.title,
        'description': plan.description,
        'due_date': plan.due_date.strftime('%Y-%m-%d') if plan.due_date else None
    } for plan in study_plans])

@app.route('/study_plans', methods=['POST'])
def add_study_plan():
    data = request.json
    new_plan = StudyPlan(
        title=data['title'],
        description=data['description'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data['due_date'] else None
    )
    db.session.add(new_plan)
    db.session.commit()
    return jsonify({'message': 'Study plan added successfully'})

@app.route('/study_plans/<int:id>', methods=['PUT'])
def edit_study_plan(id):
    try:
        data = request.json
        plan = StudyPlan.query.get(id)
        if not plan:
            return jsonify({'error': 'Study plan not found'}), 404
        plan.title = data.get('title', plan.title)
        plan.description = data.get('description', plan.description)
        due_date = data.get('due_date')
        if due_date:
            plan.due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        db.session.commit()
        return jsonify({'message': 'Study plan updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/study_plans/<int:id>', methods=['DELETE'])
def delete_study_plan(id):
    plan = StudyPlan.query.get(id)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({'message': 'Study plan deleted successfully'})

# Routes for time management
@app.route('/time_management', methods=['GET'])
def get_time_management_tasks():
    time_management_tasks = TimeManagement.query.all()
    return jsonify([{
        'id': task.id,
        'task': task.task,
        'start_time': task.start_time.strftime('%Y-%m-%d %H:%M:%S'),
        'end_time': task.end_time.strftime('%Y-%m-%d %H:%M:%S')
    } for task in time_management_tasks])

@app.route('/time_management', methods=['POST'])
def add_time_management_task():
    data = request.json
    if not data.get('task') or not data.get('start_time') or not data.get('end_time'):
        return jsonify({'error': 'task, start_time, and end_time are required'}), 400

    try:
        new_task = TimeManagement(
            task=data['task'],
            start_time=datetime.strptime(data['start_time'], '%Y-%m-%dT%H:%M'),
            end_time=datetime.strptime(data['end_time'], '%Y-%m-%dT%H:%M')
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Time management task added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500  # Internal Server Error

@app.route('/time_management/<int:id>', methods=['PUT'])
def edit_time_management_task(id):
    try:
        data = request.json
        if 'description' not in data:
            return jsonify({'error': 'Description is required'}), 400

        task = TimeManagement.query.get(id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        task.description = data['description']
        db.session.commit()
        return jsonify({'message': 'Time management task updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/time_management/<int:id>', methods=['DELETE'])
def delete_time_management_task(id):
    task = TimeManagement.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Time management task deleted successfully'})

# Routes for weekly reports
@app.route('/weekly_reports', methods=['GET'])
def get_weekly_reports():
    weekly_reports = WeeklyReport.query.all()
    return jsonify([{
        'id': report.id,
        'week_start': report.week_start.strftime('%Y-%m-%d'),
        'week_end': report.week_end.strftime('%Y-%m-%d'),
        'content': report.content
    } for report in weekly_reports])

@app.route('/weekly_reports', methods=['POST'])
def add_weekly_report():
    data = request.json
    new_report = WeeklyReport(
        week_start=datetime.strptime(data['week_start'], '%Y-%m-%d').date(),
        week_end=datetime.strptime(data['week_end'], '%Y-%m-%d').date(),
        content=data['content']
    )
    db.session.add(new_report)
    db.session.commit()
    return jsonify({'message': 'Weekly report added successfully'})

@app.route('/weekly_reports/<int:id>', methods=['PUT'])
def edit_weekly_report(id):
    data = request.json
    report = WeeklyReport.query.get(id)
    report.week_start = datetime.strptime(data['week_start'], '%Y-%m-%d').date()
    report.week_end = datetime.strptime(data['week_end'], '%Y-%m-%d').date()
    report.content = data['content']
    db.session.commit()
    return jsonify({'message': 'Weekly report updated successfully'})

@app.route('/weekly_reports/<int:id>', methods=['DELETE'])
def delete_weekly_report(id):
    try:
        report = WeeklyReport.query.get(id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        
        db.session.delete(report)
        db.session.commit()
        return jsonify({'message': 'Weekly report deleted successfully'})
    except Exception as e:
        # Log the error
        print(f"Error deleting report: {e}")
        return jsonify({'error': 'An error occurred while deleting the report'}), 500
    
@app.route('/weekly_reports_page')
def weekly_reports_page():
    return render_template('weekly_reports.html')

@app.route('/favicon.ico')
def favicon():
    return '', 404

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
