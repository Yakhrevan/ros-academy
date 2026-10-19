<div align="center">

# ROS Academy — Interactive Robotics Lab

[![ROS 2 Humble](https://img.shields.io/badge/ROS%202-Humble-1F6FEB?style=for-the-badge&logo=ros&logoColor=white)](https://docs.ros.org/en/humble/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Robotics Learning](https://img.shields.io/badge/Robotics-Learning%20Platform-2563EB?style=for-the-badge)](https://github.com/Yakhrevan/ros-academy)

**Explore robotics concepts through structured lessons, interactive visualizations, quizzes, and engineering learning paths.**

[Repository](https://github.com/Yakhrevan/ros-academy) · [ROS 2 Notebook](https://github.com/Yakhrevan/ros2-robotics-engineering-notebook) · [Developer Portfolio](https://yakhrevan.github.io/Yakhrevan-Portfolio/)

</div>

---

# ROS Academy — Interactive Robotics Lab

A visual, gamified learning platform designed to teach robotics from Linux fundamentals through ROS 2 internals and industrial engineering.

**Primary learning baseline:** ROS 2 Humble on Ubuntu 22.04.

## What is included in this first release

- Responsive dashboard with learning-path navigation and XP progress.
- Linux command simulator for common filesystem, process and ROS CLI commands.
- ROS 2 publisher → topic → subscriber message-flow visualization.
- Expandable conceptual ROS 2 communication stack (rclpy/rclcpp → rcl → RMW → DDS).
- Structured lessons with learning objectives, explanations, code examples, expected behavior, industrial context and knowledge checks.
- Interactive quiz feedback, completion tracking and quick challenges.
- Project roadmaps for differential-drive robots, warehouse AMRs, embedded motor integration and drone telemetry.
- GitHub Pages deployment workflow.

## Curriculum roadmap

1. Linux: terminal, filesystem, permissions, processes, shell scripting, networking, SSH and Git.
2. Programming: Python, modern C++, memory, concurrency, CMake and testing.
3. ROS 2 Core: packages, nodes, topics, services, actions, parameters, launch and interfaces.
4. ROS 2 Internals: client libraries, RMW, DDS, discovery, QoS, executors and callback groups.
5. Modeling and simulation: URDF, Xacro, TF2, RViz2, Gazebo and ros2_control.
6. Autonomy: sensors, SLAM, localization, costmaps, planners, controllers and Nav2.
7. Hardware integration: STM32/ESP32, micro-ROS, CAN, drivers, motor control and real-time constraints.
8. Industrial engineering: testing, tracing, CI/CD, deployment, fleet operations, diagnostics, security and safety engineering.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys the app on pushes to `main`.

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Open the **Actions** tab and inspect the “Deploy ROS Academy to GitHub Pages” workflow.
4. When the workflow succeeds, the expected site URL is https://yakhrevan.github.io/ros-academy/.

## Important accuracy and safety notes

The Linux terminal and ROS 2 message-flow widgets in this release are **browser-based conceptual simulations**, not a live shell, DDS network or ROS 2 runtime. Real command execution requires an isolated, resource-limited execution environment. Never execute arbitrary learner commands on the web server.

The platform is a growing curriculum starter, not yet a complete industrial certification course. Lesson coverage, tested examples, actual Gazebo/ROS runtime integration, persistent accounts and backend-based progress sync are planned expansion work.
