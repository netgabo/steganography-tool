# Steganography Tool

## Overview

This Steganography Tool is a web-based application that allows users to hide and reveal secret messages within images. It uses the least significant bit (LSB) technique to embed data into image files without noticeably altering their appearance. This tool is built with Next.js, React, and TypeScript, providing a modern and responsive user interface.

## Features

- **Message Encoding**: Hide secret messages within images.
- **Message Decoding**: Extract hidden messages from encoded images.
- **Key Management**: 
  - Option to use a manual key or generate a random key.
  - Copy and download generated keys.
- **User-Friendly Interface**: 
  - Drag and drop interface for image upload.
  - Interactive tabs for encoding and decoding operations.
- **Image Handling**: 
  - Preview uploaded images.
  - Download modified images with hidden messages.
- **Security**: Client-side processing ensures message privacy.

## Technologies Used

- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (version 14.x or later)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/steganography-tool.git
   ```

2. Navigate to the project directory:
   ```bash
   cd steganography-tool
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3333) in your browser to see the application.

## Usage

### Encoding a Message

1. Click on the "Encode" tab.
2. Upload an image using the drag and drop interface or by clicking on the upload area.
3. Choose whether to use a manual key or generate a random key.
4. If using a manual key, enter it in the provided input field.
5. Click the "Hide Key" button to embed the key into the image.
6. Once processed, download the modified image and save the generated key securely.

### Decoding a Message

1. Click on the "Decode" tab.
2. Upload the image containing the hidden message.
3. Enter the key that was used during the encoding process.
4. Click the "Decode Image" button.
5. The hidden message will be revealed if the correct key is provided.

## Contributing

Contributions to improve the Steganography Tool are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive commit messages.
4. Push your changes to your fork.
5. Submit a pull request to the main repository.

Please ensure your code adheres to the existing style and passes all tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the creators and maintainers of Next.js, React, and TypeScript.
- Special thanks to the shadcn/ui project for providing excellent UI components.

## Disclaimer

This tool is for educational and recreational purposes only. Users are responsible for ensuring they have the right to modify and share any images used with this tool.
