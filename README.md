# NIMC Biometric Verification Pipeline

A frontend architecture and data pipeline designed for real-time biometric spoof-detection. This system captures image data via HTML5 Canvas and transmits it securely to a remote machine learning backend.

##  Technical Overview
* **Architecture:** Vanilla JavaScript, HTML5 Canvas, MediaDevices API
* **Data Integration:** WebSocket API, Base64 Image Streaming, JSON Payload Handling
* **Quality Assurance:** Manual data annotation utilizing `labelImg` to establish ground-truth datasets for the ML model.

##  Data Privacy & Compliance Notice
In strict adherence to the Nigeria Data Protection Regulation (NDPR) and general biometric data security standards, **no raw biometric images or government datasets are hosted in this public repository.** To demonstrate the data annotation and validation workflow without compromising security, only the numerical bounding-box coordinate files (`.txt` / `.xml`) generated during the QA process are provided in the `sample_annotation_data` directory. 

##  Architecture Flow
1. **Capture:** Browser API accesses the local camera feed.
2. **Process:** Frame is drawn to an HTML5 Canvas and encoded to Base64.
3. **Transmit:** Payload is sent via WebSockets to the Python ML server.
4. **Validate:** JSON response triggers UI state changes based on spoof-detection results.
