# Use an official Python runtime as a parent image
FROM python:3.10

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y libssl-dev libffi-dev

# Install dependencies
RUN pip install --no-cache-dir cryptography
RUN pip install --no-cache-dir -r requirements.txt


# Expose port 5000 for Flask API
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=app.py

# Run the application
CMD ["python", "app.py"]
