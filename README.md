# Social Media Addiction Analysis Dashboard

## About This Project

This project is an interactive data visualization dashboard designed to explore and analyze the impact of social media usage on university students. It leverages a dataset of student records to provide insights into how social media addiction correlates with mental health, academic performance, sleep patterns, and personal relationships.

The application features two main modes of exploration:
- **Analyze Data:** A comprehensive, dashboard that allows for deep-diving into the data with extensive filtering capabilities.
- **Explore Room:** An immersive, cinematic experience where users can interact with a virtual environment. Clicking on "hotspots" (Academic, Relationships, Mental Health, Geographics) zooms into specific themes, presenting focused visualizations overlaid on a dynamic background.

## Visualizations Used

We utilize a wide variety of D3.js-based visualizations to represent complex data relationships effectively:

- **Bar Charts:** Used for categorical comparisons such as Gender Distribution, Age Distribution, Academic Levels, and Platform Popularity.
- **Box Plots:** Display statistical distributions for Usage Duration across different platforms and Conflicts based on Relationship Status.
- **Bubble Charts:** An alternative, visually engaging way to view the relative popularity of different Social Media Platforms.
- **Donut Charts:** Visualize part-to-whole relationships, specifically for Relationship Status distribution.
- **Line Charts:** Show trends and correlations, such as the relationship between Daily Usage and Academic Impact, or Mental Health Scores over Age.
- **Pie Charts:** Represent binary or simple proportional data, like the percentage of students reporting negative academic impacts.
- **Scatter Graphs:** Plot individual data points to reveal correlations between two continuous variables, such as Mental Health Score vs. Daily Usage Hours.
- **Spider (Radar) Charts:** Create "Platform Personality Profiles," comparing different social media platforms across multiple metrics like Addiction Score, Sleep Loss, and Conflicts.
- **World Map:** A geographic visualization displaying the distribution of students and various metrics across different countries.

## Filters & Interaction

To allow users to drill down into specific demographics and cohorts, the application includes a robust filtering system:

- **Gender:** Filter by Male, Female, or Non-binary/Other (Multi-select checkboxes).
- **Academic Level:** Filter by Undergraduate, Graduate, etc. (Multi-select checkboxes).
- **Age:** A dynamic Range Slider to filter students within a specific age bracket.
- **Most Used Platform:** Select specific platforms (e.g., Instagram, TikTok, Twitter) to analyze.
- **Relationship Status:** Filter by Single, In a Relationship, Complicated, etc.
- **Country:** Geographic filtering to focus on specific regions.

## Technologies

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, Vanilla CSS
- **Visualization:** D3.js only
- **Animations:** Framer Motion
- **Icons:** Lucide React, React Icons

## How to run the project

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
