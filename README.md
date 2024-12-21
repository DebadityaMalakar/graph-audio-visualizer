Here’s a README for your project:

---

# F(x) Graph and Audio Visualizer

## Description

This project allows users to visualize mathematical functions as graphs and listen to their audio representations in real-time. The tool enables interactive graph generation, dynamic function definition, and audio playback using Tone.js. It is designed with a dark and light mode theme and provides intuitive input fields for function expression, as well as configurable lower and upper limits for the x-axis.

---

## Features

- **Graphing Function**: Enter a mathematical function for `f(x)` (e.g., `Math.sin(x)`, `3*x + 1`, or `collatz`).
- **Audio Visualization**: Hear the audio playback of the graph as a series of musical notes.
- **Dynamic Limits**: Adjust the range of the x-axis (lower and upper limits).
- **Dark/Light Mode**: Toggle between dark and light themes.
- **Reset**: Reset the graph, input fields, and audio state to their default values.

---

## Tech Stack

- **Frontend**: 
  - React (via Remix)
  - TailwindCSS for styling
  - MathJS (instead of eval() )
- **Backend**: 
  - Tone.js for audio synthesis
- **Canvas API**: For rendering graphs dynamically
- **JavaScript**: For evaluating mathematical functions and handling interactivity

---

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/debadityamalakar/graph-audio-visualizer.git
   ```

2. **Install dependencies**:
   ```bash
   cd graph-audio-visualizer
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to see the project in action.

---

## Usage

### Defining the Function
- **Input the function**: In the `f(x)` input field, enter a valid JavaScript mathematical expression, such as `Math.sin(x)`, `x * x`, or `3 * x + 1`.
- **Collatz Function**: If you enter `collatz`, it will generate the Collatz sequence for a given starting value.

### Adjusting Limits
- **Lower Limit**: Set the starting point for the x-axis. This determines where the graph begins.
- **Upper Limit**: Set the endpoint for the x-axis. The graph will be generated for all x values between the lower and upper limits.

### Graphing and Audio
- **Generate Graph**: After setting the function and limits, click the **Generate Graph** button to display the graph.
- **Play Audio**: Click the **Play Audio** button to start playing an audio representation of the graph.
- **Stop Audio**: Stop the audio playback with the **Stop Audio** button.
- **Reset**: Reset the input fields, graph, and audio state by clicking the **Reset** button.

### Dark/Light Mode
Toggle between dark and light themes by clicking the **Dark Mode / Light Mode** button in the top-right corner.

---

## File Structure

```
/graph-audio-visualizer
├── /public
│   └── /assets
│       └── (static assets like images)
├── /src
│   ├── /components
│   ├── /styles
│   ├── /utils
│   └── /pages
├── /package.json
├── /tailwind.config.js
├── /tsconfig.json
└── /README.md
```

---

## Contributions

Contributions are welcome! To contribute, please fork the repository and create a pull request. Ensure that your code is clean and well-documented. If you're adding new features, please update the README accordingly.

---

## License

This project is open-source and available under the MIT License.

---

## Acknowledgements

- **Tone.js**: For handling audio synthesis and playback.
- **React**: For building the user interface.
- **TailwindCSS**: For rapid and responsive styling.
- **Canvas API**: For rendering the dynamic graph.

---

## Contact

For questions or inquiries, feel free to reach out via [email](mailto:debadityamalakar@gmail.com).

---

Let me know if you need any additional information in the README!
