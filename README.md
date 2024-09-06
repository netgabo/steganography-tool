# Steganography Tool

This is a web-based steganography tool that allows users to hide and reveal secret messages within images. The tool uses the least significant bit (LSB) technique to embed data into image files without noticeably altering their appearance.

## Features

- Encode secret messages into images
- Decode hidden messages from images
- Support for manual key input or automatic key generation
- Drag and drop interface for image upload
- Download modified images with hidden messages
- Copy and download generated keys

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/netgabo/steganography-tool.git
   ```

2. Navigate to the project directory:
   ```
   cd steganography-tool
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3333](http://localhost:3333) in your browser to see the application.

## Usage

1. Upload an image using the drag and drop interface or by clicking on the upload area.
2. Choose whether to use a manual key or generate a random key.
3. If using a manual key, enter it in the provided input field.
4. Click the "Hide Key" button to embed the key into the image.
5. Download the modified image and save the generated key.
6. To decode a message, upload the modified image and enter the key used during encoding.
7. Click the "Decode Image" button to reveal the hidden message.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
